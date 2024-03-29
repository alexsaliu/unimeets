import React, { useState, useEffect } from 'react';
import './grid.css';
import './name.css';
import '../home.css';
import Grid from './Grid.js';
import Logo from './Logo.js';
import { randomNameGenerator } from '../helpers.js';
import {
    checkGroupRequest,
    joinGroupRequest
} from '../requests.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Name = () => {
    const [groupLink, setGroupLink] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [promptName, setPromptName] = useState(true);
    const [userName, setUserName] = useState("");
    const [checkingGroup, setCheckingGroup] = useState(true);
    const [groupScreen, setGroupScreen] = useState(false);
    const [privateGroup, setPrivateGroup] = useState(true);
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let link = window.location.pathname;
        link = link.split('/')[1];
        const checkGroup = async () => {
            setLoading(true);
            const check = await checkGroupRequest(link);
            setLoading(false);
            console.log("Group Check: ", check);
            if (!check.success || check.success === 'error') window.location = '/';
            setGroupLink(link);
            setCheckingGroup(false);
            if (!check.privateGroup) setPrivateGroup(false);
            console.log("PRIVATE :", check.privateGroup);
            handelName(link);
        }
        checkGroup();
    }, [])

    const handelName = (link) => {
        if (!localStorage.getItem("groups")) {
            localStorage.setItem("groups", "{}");
            setPromptName(true);
        }
        else {
            let groups = JSON.parse(localStorage.getItem("groups"));
            if (groups[link]) {
                setUserName(groups[link].name);
                setGroupScreen(groups[link].groupScreen);
                setPromptName(false);
            }
            else {
                setPromptName(true);
            }
        }
    }

    const handelSettingName = async (link, name, privateGroup) => {
        if (!privateGroup && !name) {
            setWarning("Click above to generate a name");
        }
        else if (name.length < 2) {
            setWarning("Name must be at least 2 characters");
        }
        else {
            let groups = JSON.parse(localStorage.getItem("groups"));
            groups[link] = {'name': "", 'groupScreen': ""};
            groups[link].name = name;
            groups[link].groupScreen = false;
            setGroupScreen(false);
            localStorage.setItem("groups", JSON.stringify(groups));
            setUserName(nameInput);
            setLoading(true);
            const joinedGroup = await joinGroupRequest(link, name, privateGroup);
            setLoading(false);
            if (joinedGroup.success === 'error') {
                setWarning("There was an error trying to join your group");
            }
            else if (joinedGroup.success) {
                setPromptName(false);
            }
            console.log(joinedGroup);
        }
    }

    const generateName = () => {
        const name = randomNameGenerator();
        setNameInput(name);
    }

    if (checkingGroup) {
        return (
            <div className="name-section">
                <div className="logo-container">
                    <Logo loading={loading} />
                </div>
            </div>
        );
    }
    else if (promptName) {
        return (
            <div className="name-section">
                <a href="/">
                    <div className="logo-container">
                        <Logo loading={loading} />
                    </div>
                </a>
                <h1>Unimeets</h1>
                <div className="name-form">
                    <div className="name-title">Joining: &nbsp;<span>{groupLink}</span></div>
                    {privateGroup ?
                        <div className="home-input-container">
                            <div className="input-icon"><FontAwesomeIcon icon={faUser} /></div>
                            <input className="home-input" onChange={(e) => setNameInput(e.target.value)} type="text" placeholder="Your Name" />
                        </div> :
                        <button className="main-btn generate-name" onClick={() => generateName()}>{!nameInput ? 'Generate Name' : nameInput}</button>
                    }
                    <button className="submit-btn" onClick={() => handelSettingName(groupLink, nameInput, privateGroup)}>Submit Name</button>
                    {warning ? <div className="error name-error">{warning}</div> : ''}
                </div>
            </div>
        );
    }
    else {
        return (
            <div id="grid">
                <Grid groupLink={groupLink} userName={userName} screen={groupScreen} privateGroup={privateGroup} />
            </div>
        );
    }
}

export default Name;
