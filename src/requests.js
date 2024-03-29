// const api = 'http://localhost:3001';
const api = 'https://unimeetsapi.herokuapp.com';

const checkGroupRequest = (link) => {
    return fetch(`${api}/check-group`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link})
    })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

const createGroupRequest = (name, privateGroup) => {
    return fetch(`${api}/create-group`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, privateGroup})
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

const joinGroupRequest = (link, name, privateGroup) => {
    return fetch(`${api}/join-group`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link, name, privateGroup})
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })

}

const updateVoteRequest = (link, name, vote) => {
    return fetch(`${api}/vote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link, name, vote})
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

const groupInfoRequest = (link) => {
    return fetch(`${api}/group-info/${link}`)
    .then((response) => response.json())
    .then((data) => {
        return data
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

const updateAvailabilityRequest = (link, name, availability) => {
    return fetch(`${api}/update-availability`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link, name, availability})
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

const removeMemberRequest = (link, member) => {
    return fetch(`${api}/remove-member`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link, member})
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((err) => {
        console.log("Error: ", err);
        return {"success": "error"};
    })
}

module.exports = {
    checkGroupRequest,
    createGroupRequest,
    joinGroupRequest,
    groupInfoRequest,
    updateAvailabilityRequest,
    updateVoteRequest,
    removeMemberRequest
};
