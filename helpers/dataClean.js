const updateRole = (data) => {
    const approvedReq = []
    const rejectedReq = []

    for (const requestLine in data) {
        
        if(data[requestLine] === 'approved') {
            approvedReq.push(requestLine)
        }

        if (data[requestLine] === 'rejected') {
            rejectedReq.push(requestLine)
        }
    }

    return { approvedReq, rejectedReq }
}

module.exports = {
    updateRole
}