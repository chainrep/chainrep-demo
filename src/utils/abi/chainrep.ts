const abi = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      }
    ],
    "name": "ContractReported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "certificateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "authority",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "CreateCertificate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "domain",
        "type": "string"
      }
    ],
    "name": "DomainReported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "certificateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "authority",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "IssueCertificate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "PublishReport",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "certificateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "authority",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "RevokeCertificate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "tag",
        "type": "string"
      }
    ],
    "name": "TagReported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "certificateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "TransferCertificateAuthority",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "UnPublishReport",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "string", "name": "name", "type": "string" }],
    "name": "createCertificate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "certificateIds",
        "type": "uint256[]"
      }
    ],
    "name": "getCertifiedContractReports",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "reportId", "type": "uint256" },
          { "internalType": "address", "name": "reviewer", "type": "address" },
          { "internalType": "string", "name": "uri", "type": "string" },
          { "internalType": "bool", "name": "published", "type": "bool" }
        ],
        "internalType": "struct IChainRep.Report[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "reportId", "type": "uint256" }
    ],
    "name": "getReport",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "reportId", "type": "uint256" },
          { "internalType": "address", "name": "reviewer", "type": "address" },
          { "internalType": "string", "name": "uri", "type": "string" },
          { "internalType": "bool", "name": "published", "type": "bool" }
        ],
        "internalType": "struct IChainRep.Report",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "authority", "type": "address" },
      { "internalType": "uint256", "name": "certificateId", "type": "uint256" }
    ],
    "name": "isCertificateAuthority",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "reviewer", "type": "address" },
      { "internalType": "uint256", "name": "certificateId", "type": "uint256" }
    ],
    "name": "isCertified",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "reviewer", "type": "address" },
      { "internalType": "uint256", "name": "reportId", "type": "uint256" }
    ],
    "name": "isReviewer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "certificateId", "type": "uint256" },
      { "internalType": "address", "name": "reviewer", "type": "address" }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numCertificates",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numReports",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "contractAddresses",
        "type": "address[]"
      },
      { "internalType": "string[]", "name": "domains", "type": "string[]" },
      { "internalType": "string[]", "name": "tags", "type": "string[]" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "publishReport",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "certificateId", "type": "uint256" },
      { "internalType": "address", "name": "reviewer", "type": "address" }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "certificateId", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "transferCertificateAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "reportId", "type": "uint256" }
    ],
    "name": "unPublishReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
export default abi;