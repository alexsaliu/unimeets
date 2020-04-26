import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import './grid.css';
import Timeslot from './Timeslot.js';
import logo from '../assets/logo.png';
import {
    prepareGridData,
    setScreen
 } from '../helpers.js';
import {
    checkGroupRequest,
    groupInfoRequest,
    updateAvailabilityRequest,
    updateVoteRequest,
    removeMemberRequest
} from '../requests.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCommentDots, faUsers, faLink } from '@fortawesome/free-solid-svg-icons';

const api = 'http://localhost:3001';

// Socket io connection with server
const socket = socketIOClient(api);

const Grid = ({groupLink, userName, screen, privateGroup}) => {
    const [timeSlots, setTimeSlots] = useState("");
    const [availability, setAvailability] = useState("");
    const [groupMembers, setGroupMembers] = useState("");
    const [groupScreen, setGroupScreen] = useState(screen);
    const [vote, setVote] = useState(-1);
    const [admin, setAdmin] = useState(false);
    const [message, setMessage] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);

    const textAreaRef = useRef(null);

    useEffect(() => {
        const getGroupInfo = async () => {
            const info = await groupInfoRequest(groupLink);
            console.log("Group Info: ", info);
            renderGrid(groupLink, userName, info);
            socket.emit('joinRoom', { userName, groupLink });
        }
        getGroupInfo();

        socket.on(`message`, (message) => {
            console.log("MESSAGE: ", message);;
        })

        socket.on(`update`, (info) => {
            console.log("MESSAGE: ", info);
            renderGrid(groupLink, userName, info);
        })
    }, [])

    const sendMessage = (message) => {
        socket.emit('message', { message });
    }
    const emitUpdate = () => {
        socket.emit('update');
    }

    const renderGrid = async (link, name, info) => {
        const gridData = prepareGridData(link, name, info);
        let members = [];
        let userIsInGroup = false;
        for (let i = 0; i < info.length; i++) {
            members.push(info[i].member_name);
            // Set availability
            if (info[i].member_name === name) {
                userIsInGroup = true;
                if (!privateGroup && info[i].admin) setAdmin(true);
                const userAvailability = info[i].availability.split("").map(Number);
                setAvailability(userAvailability);
            }
        }
        if (!userIsInGroup) removeUser(name);
        setGroupMembers(members);
        setVote(gridData.vote);
        setTimeSlots(gridData.allTimeSlots);
    }

    const removeUser = (name) => {
        let groups = JSON.parse(localStorage.getItem("groups"));
        delete groups[groupLink];
        localStorage.setItem("groups", JSON.stringify(groups));
        window.location = '/';
    }

    const removeMember = async (link, member) => {
        const response = await removeMemberRequest(link, member);
        if (response.success) {
            emitUpdate();
        }
        console.log(`deleting ${member}`);
        console.log(response);
    }

    const selectTime = (index) => {
        let currentAvailability = availability;
        currentAvailability[index] = !currentAvailability[index] ? 1 : 0;
        setAvailability(currentAvailability);
        console.log(currentAvailability);
    }

    const selectVote = async (vote) => {
        setVote(vote);
    }

    const updateAvailability = async (link, name, userAvailability) => {
        userAvailability = userAvailability.join('');
        const update = await updateAvailabilityRequest(link, name, userAvailability);
        console.log("Update: ", update);
        emitUpdate();
    }

    const updateVote = async (link, name, vote) => {
        const updatedVote = await updateVoteRequest(link, name, vote);
        console.log("updatedVote: ", updatedVote);
        emitUpdate();
    }

    const toggleScreens = (link, toggle) => {
        setScreen(link, !toggle);
        setGroupScreen(!toggle);
    }

    const selectLink = (ok) => {
        textAreaRef.current.select();
        document.execCommand('copy');
        console.log("Success: ");
    }

    if (timeSlots) {
        return (
            <div className="grid-container">
                <div className="grid-header">
                    <div className="logo-container-grid"><img src={logo} alt="Unimeets" /></div>
                    <div onClick={() => selectLink("ok")} className="group-link">
                         <textarea readOnly ref={textAreaRef} value={`${window.location}`} />{groupLink} &nbsp; <FontAwesomeIcon icon={faLink} />
                    </div>
                    <div className="members-icon"><FontAwesomeIcon icon={faUsers} /><span>{groupMembers.length}</span></div>
                </div>
                {membersOpen ? <div className="members-container">
                    <div className="members">{groupMembers.map((member, i) =>
                        <div key={i}>{member}{!privateGroup && !admin ? '' : <div onClick={() => removeMember(groupLink, member)} className="trash-icon"><FontAwesomeIcon icon={faTrash} /></div>}</div>
                    )}</div>
                    <div onClick={() => setMembersOpen(false)}>BACK</div>
                </div> : ''}
                <div className="grid-days">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((item, i) => <div key={i}>{item}</div>)}
                </div>
                <div className="grid">
                    <div className="grid-times">
                        {['8', '', '9', '', '10', '', '11', '', '12', '', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '7']
                        .map((item, i) => <div key={i}>{item}</div>)
                        }
                    </div>
                    {timeSlots.map((timeSlot, i) =>
                        <Timeslot
                            key={i}
                            index={i}
                            info={timeSlot}
                            selectTime={selectTime}
                            groupScreen={groupScreen}
                            availability={availability}
                            selectVote={selectVote}
                            vote={vote}
                        />
                    )}
                </div>
                <div className="grid-footer">
                    <button onClick={() => toggleScreens(groupLink, groupScreen)}>{groupScreen ? "Change Availability" : "View Group"}</button>
                    {!groupScreen
                    ? <button onClick={() => updateAvailability(groupLink, userName, availability)}>Update Availability</button>
                    : <button onClick={() => updateVote(groupLink, userName, vote)}>Update Vote</button> }
                    <div onClick={() => setChatOpen(false)} className="chat-icon">
                        <FontAwesomeIcon icon={faCommentDots} />
                        <br/>
                        <span style={{'fontSize': '0.6rem'}}>coming soon</span>
                    </div>
                </div>
                {chatOpen ? <div className="chat-container">
                    <button disabled={!message.length} onClick={() => sendMessage(message)}>Send Message</button>
                    <input onChange={(e) => setMessage(e.target.value)} type="text" />
                    <div onClick={() => setChatOpen(false)}>BACK</div>
                </div> : ''}
            </div>
        );
    }
    else {
        return (
            <div>Loading...</div>
        );
    }
}

export default Grid;
