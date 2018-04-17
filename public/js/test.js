const moment = require('moment')
const wait = require('promise-wait')
const tc = require('truffle-contract')
const detectNetwork = require('web3-detect-network')
const {
    soliditySHA3
} = require('ethereumjs-abi')
const {
    sha3
} = require('ethereumjs-util')
const Buffer = require('buffer/').Buffer
const Web3WsProvider = require('web3-providers-ws')
const arrayBufferToBuffer = require('arraybuffer-to-buffer')

const source = require('../../build/contracts/DocAuth.json');
const rinkyByUrl = 'https://rinkeby.infura.io/8Ofq8yj9gcP6EVmKD3NG';


var docAuthABI = [{
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "recordHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "authorName",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "title",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "email",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "isDocExists",
                "type": "bool"
            }
        ],
        "name": "_NewDocAuth",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "recordHash",
                "type": "bytes32"
            },
            {
                "name": "authorName",
                "type": "bytes32"
            },
            {
                "name": "title",
                "type": "bytes32"
            },
            {
                "name": "email",
                "type": "bytes32"
            }
        ],
        "name": "authNewDoc",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "newOwner",
            "type": "address"
        }],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "",
            "type": "bytes32"
        }],
        "name": "documentdata",
        "outputs": [{
                "name": "recordHash",
                "type": "bytes32"
            },
            {
                "name": "authorName",
                "type": "bytes32"
            },
            {
                "name": "title",
                "type": "bytes32"
            },
            {
                "name": "email",
                "type": "bytes32"
            },
            {
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "name": "isDocExists",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "record",
            "type": "bytes32"
        }],
        "name": "exists",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "authorName",
            "type": "bytes32"
        }],
        "name": "getDocDetailFromAuthorName",
        "outputs": [{
            "name": "",
            "type": "bytes32[]"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "record",
            "type": "bytes32"
        }],
        "name": "getDocDetailFromHash",
        "outputs": [{
                "name": "",
                "type": "bytes32"
            },
            {
                "name": "",
                "type": "bytes32"
            },
            {
                "name": "",
                "type": "bytes32"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]

let instance = null
let account = null
let network = 'rinkeby'
var contract;
let Contract;
let addresses = {
    mainnet: '0xd749c968399b8cbdf2ce95d1f87c1c38157c5794',
    rinkeby: '0x482d35e1Fd66805A4cBddE1Ae8eD129684Ca1d4f'
}

function init() {
    // fetch to which provider netwrok is connected
    getProvider();

    network = 'rinkeby'; // as of now configured for rinkeby
    contractAddress = addresses[`${network}`];
    account = getAccount() // get account for metamask or any other connected provider

    // initializing contract
    Contract = web3.eth.contract(docAuthABI);
    contract = Contract.at(contractAddress);
}


/**
 * PROVIDER
 */

function getProvider() {
    if (window.web3) {
        return window.web3.currentProvider
    }

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider(rinkyByUrl));
    }
}

function authNewDoc(hash, authorName, title, email) {
    return new Promise((resolve, reject) => {
        exists(hash).then((isExists) => {

            if (isExists) {
                fillDocumentDetails(hash)
                $("#authDocStatus").text("Document already registered");
                reject({
                    "error": "document exists"
                });
            } else {
                contract.authNewDoc(hash, authorName, title, email, (err, result) => {
                    resolve(result);
                });
            }
        })
    })
}

function exists(hash) {
    return new Promise((resolve, reject) => {
        contract.exists(hash, (err, result) => {
            if (err) {
                reject(err)
            }
            resolve(result);
        });
    })
}

function getDocDetailFromHash(hash) {
    return new Promise((resolve, reject) => {

        contract.getDocDetailFromHash(hash, function (err, result) {
            if (err) {
                console.log('error hash', err);
                reject(err);
            }
            console.log('result from hash', result);
            resolve(result);
        })
    })
}

function getDocDetailFromAuthorName(authorName) {
    return new Promise((resolve, reject) => {
        console.log('get author details , authorname ----', authorName);

        contract.getDocDetailFromAuthorName(authorName, (err, result) => {
            if (err) {
                console.log('error from getDocDetailFromAuthorName', err);
                reject("error from getDocDetailFromAuthorName", err)
            }

            console.log('result details from name', result);
            resolve(result);
        })
    })
}

function fillDocumentDetails(hash) {
    getDocDetailFromHash(hash)
        .then((result) => {
            console.log("resultssssssssss", result);
            var timestamp = getTimeFromTimeStamp(result[3]['c'][0]);
            alert(`
        Document already exists with below details
        \n
        Author Name - ${web3.toAscii(result[0])} 
        \n
        Title - ${web3.toAscii(result[1])}
        \n
        Email - ${web3.toAscii(result[2])}
        \n
        Timestamp -  ${timestamp}
        `)
        })
        .catch((err) => {
            console.log("Error in fetching document details", err);
            alert("Error in fetching document details");
        })
}



function setDetailsFromAuthorName(result) {

    let resultLength = result.length;

    for (let i = 0; i < resultLength; i++) {
        getDocDetailFromHash(result[i])
            .then((value) => {
                console.log("setDetailsFromAuthorName", value);
                $("#details").append(`<div class="zombie">
            <ul> 
              <li>Author Name: ${web3.toAscii(value[0])}</li>
              <li>Title: ${web3.toAscii(value[1])}</li>
              <li>Email: ${web3.toAscii(value[2])}</li>
            </ul>
          </div>`);
                // alert(`
                // Document already exists with below details
                // \n
                // Author Name - ${web3.toAscii(result[0])} 
                // \n
                // Title - ${web3.toAscii(result[1])}
                // \n
                // Email - ${web3.toAscii(result[2])}
                // \n
                // Timestamp -  ${web3.toAscii( moment.unix(result[3]).format('YYYY-MM-DD hh:mmA') )}
                // `)
            })
            .catch((err) => {
                console.log("Error in fetching document details", err);
                alert("Error in fetching document details");
            })
    }
}

function getTimeFromTimeStamp(timestamp) {
    console.log("in ========= timestamp ======",timestamp);
    var newDate = new Date();
    newDate.setTime(timestamp * 1000);
    return newDate.toUTCString();
}
window.addEventListener('load', function () {

    try {
        init()

        if (getAccount()) {
            this.console.log("in load get ACCOUNT CONDITION")
            setUpEvents()
        } else {
            // TODO: not use innerHTML
            //publisherInfo.innerHTML = `Please install or unlock MetaMask to update your list of sellers`
        }
    } catch (error) {
        alert(error.message)
    }



    /**
     * STAMP FORM
     */

    const stampFileInput = document.querySelector('#stampFile')
    const stampOutHash = document.querySelector('#stampHash')
    const stampForm = document.querySelector('#stampForm')

    stampFileInput.addEventListener('change', handleStampFile, false)
    stampForm.addEventListener('submit', handleStampForm, false)

    // does document exists event
    $("#isExists").click(function (event) {
        event.preventDefault()
        console.log('isexists click');
        exists(stampOutHash.value).then((result) => {
            if (result) {
                fillDocumentDetails(stampOutHash.value)
                $("#authDocStatus").text("Document exists on network with above details");
            } else {
                $("#authDocStatus").text("Document does not exists on network");
                alert("Document does not exists on network");
            }
        })
    })
    // get details from authorname
    $("#getDetailsFromAuthorName").click(function (event) {
        event.preventDefault();
        $("#details").empty();

        getDocDetailFromAuthorName($("#authorNameValue").val())
            .then((result) => {
                if (!result.length) {
                    alert("No record found for author name");
                } else {
                    // call function to set values in html
                    setDetailsFromAuthorName(result)
                }
            })
            .catch((error) => {
                console.log("error in getDocDetailFromAuthorName", error);
            });
    })



    async function handleStampFile(event) {
        $("#authDocStatus").text("");
        stampOutHash.value = ''
        const file = event.target.files[0]
        const hash = await fileToSha3(file)

        stampOutHash.value = hash
    }

    async function handleStampForm(event) {
        event.preventDefault()
        const target = event.target
        $("#authDocStatus").text("")
        if (!account) {
            alert('Please connect MetaMask account set to Rinkeby network')
            return false
        }

        const hash = stampOutHash.value

        if (!hash) {
            alert('Please select the document')
            return false
        }

        //target.classList.toggle('loading', true);
        $("#authDocStatus").text("Deploying Document on network , fetching status....");
        authNewDoc(hash, $("#authorName").val() || '', $("#title").val() || '', $("#email").val() || '')
            .then((result) => {
                console.log("Deploying contract result", result)
            })
            .catch((error) => {
                console.log("error at calling authNewDoc", error)
            })
        $("#authorName").val("");
        $("#title").val("");
        $("#email").val("");
        return;
    }
})

/**
 * HELPERS
 */

async function setUpEvents() {
    console.log("in setup events");
    // authNewDoc event 

    var authNewDocEvent = contract._NewDocAuth({}, 'latest');
    authNewDocEvent.watch(function (error, result) {
        if (error) {
            console.log('event error', error);
        }
        console.log('event result --', result.args, '---', web3.toAscii(result.args.email));
        $("#authDocStatus").text("Document authorized on network successfully....");
        var timestamp = getTimeFromTimeStamp(result.args.timestamp);
        alert(`
        Document authorized on network successfully with below details
        \n
        Author Name - ${web3.toAscii( result.args && result.args.authorName ? result.args.authorName:"")} 
        \n
        Title - ${web3.toAscii(result.args && result.args.title ? result.args.title:"")}
        \n
        Email - ${web3.toAscii(result.args && result.args.email ? result.args.email:"")}
        \n
        Timestamp - ${timestamp}
        `)
    });
    // const ws = new Web3WsProvider(`wss://${network}.infura.io/ws`);
    // ws.sendAsync = ws.send
    // const contract = tc(source)
    // const provider = ws //getWebsocketProvider()
    // contract.setProvider(provider)

    // instance = await contract.deployed()

    // instance.allEvents({
    //         fromBlock: 0,
    //         toBlock: 'latest'
    //     })
    //     .watch(function (error, log) {
    //         if (error) {
    //             console.error(error)
    //             return false
    //         }

    //         handleLog(log)
    //     })
}

function handleLog(log) {
    const name = log.event
    const args = log.args

    eventsLog.innerHTML += `<li>${name} ${JSON.stringify(args)}</li>`
}

if (!window.Promise) {
    alert('Promise support is required')
}

if (!window.FileReader) {
    alert('FileReader support is required')
}

if (!window.crypto) {
    alert('Browser crypto support is required')
}

const eventsLog = document.querySelector('#eventsLog')

function getAccount() {
    if (window.web3) {
        return window.web3.defaultAccount || window.web3.eth.accounts[0]
    }
}

function fileToBuffer(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        const readFile = function (event) {
            const buffer = reader.result
            resolve(buffer)
        }

        reader.addEventListener('load', readFile)
        reader.readAsArrayBuffer(file)
    })
}

async function bufferToSha3(buffer) {
    return `0x${sha3(buffer).toString('hex')}`
}

async function fileToSha3(file) {
    const buffer = await fileToBuffer(file)
    const hash = bufferToSha3(arrayBufferToBuffer(buffer))

    return hash
}

function getString(hex) {
    return web3.toAscii(hex).replace(/\u0000/ig, '')
}