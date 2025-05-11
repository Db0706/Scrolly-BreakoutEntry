import Image from 'next/image';
import React, { useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { authenticateUser } from 'src/services/honeycombAuth';
import { ResourceStorageEnum } from "@honeycomb-protocol/edge-client";
import { client } from 'src/utils/constants';

const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);

const AdminPage = () => {
  const wallet = useWallet();
  const [projectName, setProjectName] = useState('');
 // const [projectAddress, setProjectAddress] = useState('');
 const projectAddress = "A1gjvxiXX6sSKB22XLg3En3pY2jM1ENmVNMbQmoVXMmw";
  const [assemblerConfigAddress, setAssemblerConfigAddress] = useState('');
  const [status, setStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userProjectAssociations, setUserProjectAssociations] = useState([]);
  const [gamerTokenMintAddress, setGamerTokenMintAddress] = useState(''); // Fixed issue: uncommented state
  const [treeAddress, setTreeAddress] = useState('');

  const handleCreateProject = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setStatus('Creating project...');
      
      const {
        createCreateProjectTransaction: {
          project: projectAddr, 
          tx: txResponse
        },
      } = await edgeClient.createCreateProjectTransaction({
        name: projectName,
        authority: wallet.publicKey.toBase58(),
      });

      const res = await sendClientTransactions(edgeClient, wallet, txResponse);

      if (res[0].responses[0].error) {
        throw new Error(res[0].responses[0].status);
      }

      //setProjectAddress(projectAddr);
      setStatus('Project Created Successfully!');
      setSignature(res[0].responses[0].signature);
    } catch (error) {
      setStatus(`Error creating project: ${error.message}`);
      console.error("Error:", error);
    }
  };

  const handleCreateGamerTokenResource = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      setStatus("Authenticating wallet...");
      const accessToken = await authenticateUser(wallet);
      console.log("Access Token:", accessToken);
  
      setStatus("Creating a new Gamer Token resource...");
      const {
        createCreateNewResourceTransaction: {
          resource: resourceAddr,
          tx: txResponse,
        },
      } = await edgeClient.createCreateNewResourceTransaction(
        {
          project: projectAddress, // Use the hardcoded project address here
          authority: wallet.publicKey.toString(),
          payer: wallet.publicKey.toString(),
          params: {
            name: "Gamer Token",
            decimals: 6,
            symbol: "GMR",
            uri: "https://ddgaming.fun",
            storage: ResourceStorageEnum.LedgerState,
          },
        },
        { accessToken }
      );
  
      const res = await sendClientTransactions(edgeClient, wallet, txResponse);
  
      if (res[0].responses[0].error) {
        throw new Error(res[0].responses[0].status);
      }
  
      console.log("Created Gamer Token Resource Address:", resourceAddr);
      setGamerTokenMintAddress(resourceAddr); // Save the resource address
      setStatus(`New Gamer Token resource created successfully! Mint Address: ${resourceAddr}`);
    } catch (error) {
      console.error("Error creating Gamer Token resource:", error);
      setStatus(`Error creating Gamer Token resource: ${error.message}`);
    }
  };
  
  const handleCreateResourceTree = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      setStatus("Authenticating wallet...");
      const accessToken = await authenticateUser(wallet);
      console.log("Access Token:", accessToken);
  
      if (!gamerTokenMintAddress) {
        throw new Error("Gamer Token resource is missing. Create one first.");
      }
  
      setStatus("Creating resource tree...");
      const {
        createCreateNewResourceTreeTransaction: {
          treeAddress: merkleTreeAddress,
          tx: txResponse,
        },
      } = await edgeClient.createCreateNewResourceTreeTransaction(
        {
          resource: gamerTokenMintAddress,
          project: projectAddress, // Hardcoded project address
          authority: wallet.publicKey.toString(),
          payer: wallet.publicKey.toString(),
          treeConfig: {
            basic: {
              numAssets: 100000,
            },
          },
        },
        { accessToken }
      );
  
      const res = await sendClientTransactions(edgeClient, wallet, txResponse);
  
      if (res[0].responses[0].error) {
        throw new Error(res[0].responses[0].status);
      }
  
      console.log("Resource Tree Address:", merkleTreeAddress);
      setTreeAddress(merkleTreeAddress);
      setStatus(`Resource tree created successfully! Tree Address: ${merkleTreeAddress}`);
    } catch (error) {
      console.error("Error creating resource tree:", error);
      setStatus(`Error creating resource tree: ${error.message}`);
    }
  };
  

  const validateTree = async () => {
    try {
      const { resources } = await client.findResources({
        projects: [projectAddress],
        addresses: [gamerTokenMintAddress],
      });

      const resource = resources[0];
      console.log("Tree Details:", resource.storage.params?.merkle_trees);
    } catch (error) {
      console.error("Error validating tree:", error);
    }
  };


  const handleCreateProfileTree = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    if (!projectAddress) {
      alert("Please create a project first.");
      return;
    }

    try {
      setStatus('Creating profile tree...');
      
      const { createCreateProfilesTreeTransaction: txResponse } =
        await edgeClient.createCreateProfilesTreeTransaction({
          payer: wallet.publicKey.toString(),
          project: projectAddress.toString(),
          treeConfig: {
            basic: {
              numAssets: 100000,
            },
          },
        });

      const { tx, treeAddress } = txResponse;

      const res = await sendClientTransactions(edgeClient, wallet, tx, {
        skipPreflight: true,
      });

      console.log("Profile Tree Transaction Response:", res);

      if (res[0].responses[0].error) {
        throw new Error(res[0].responses[0].status);
      }

      setStatus(`Profile Tree Created Successfully! Tree Address: ${treeAddress}`);
      setSignature(res[0].responses[0].signature);
    } catch (error) {
      setStatus(`Error creating profile tree: ${error.message}`);
      console.error("Error creating profile tree:", error);
    }
  };

  const createAssemblerConfig = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    if (!projectAddress) {
      alert("Please create a project first.");
      return;
    }

    try {
      setStatus('Creating assembler config...');
      
      const { createCreateAssemblerConfigTransaction } = await edgeClient.createCreateAssemblerConfigTransaction({
        project: projectAddress,
        authority: wallet.publicKey.toString(),
        payer: wallet.publicKey.toString(),
        treeConfig: {
          basic: {
            numAssets: 100000,
          },
        },
        ticker: "OGGAMER",
        order: ["Status"],
      });

      const txResponse = createCreateAssemblerConfigTransaction.tx;
      const transactionResult = await sendClientTransactions(edgeClient, wallet, txResponse);
      console.log("Assembler Config Creation Result:", transactionResult);

      setAssemblerConfigAddress(createCreateAssemblerConfigTransaction.assemblerConfig);
      setStatus('Assembler Config Created Successfully!');
    } catch (error) {
      console.error("Error creating assembler config:", error);
      setStatus("Failed to create assembler config.");
    }
  };

  const fetchUsers = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setStatus('Fetching users...');
      const { user: userList } = await edgeClient.findUsers({
        wallets: [wallet.publicKey.toString()],
      });

      setUsers(userList);
      setStatus(`Fetched ${userList.length} users.`);
    } catch (error) {
      setStatus(`Error fetching users: ${error.message}`);
      console.error("Error fetching users:", error);
    }
  };

  const fetchProjectAddresses = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      setStatus("Fetching projects associated with your wallet...");
  
      const { project: projectList } = await edgeClient.findProjects({
        authorities: [wallet.publicKey.toString()]
      });
  
      if (projectList && projectList.length > 0) {
        const projectAddresses = projectList.map((proj) => proj.address);
        setProjects(projectAddresses);
        setStatus(`Found ${projectAddresses.length} project(s) associated with your wallet.`);
      } else {
        setProjects([]);
        setStatus("No projects found for this wallet.");
      }
    } catch (error) {
      setStatus(`Error fetching projects: ${error.message}`);
      console.error("Error fetching projects:", error);
    }
  };

  const findUserProjectAssociation = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setStatus("Fetching user-project associations...");

      if (users.length === 0 || projects.length === 0) {
        setStatus("No users or projects found to associate.");
        return;
      }

      const user = users[0]; // Take the first user for demonstration

      const { profile: profiles } = await edgeClient.findProfiles({
        userIds: [user.id],
        projects: projects,
      });

      const associationDetails = profiles.map(profile => ({
        projectId: profile.project,
        profileInfo: profile.info, // User's profile info for each associated project
      }));

      setUserProjectAssociations(associationDetails);
      setStatus(`User is associated with ${associationDetails.length} project(s).`);

    } catch (error) {
      setStatus(`Error fetching user-project association: ${error.message}`);
      console.error("Error fetching user-project association:", error);
    }
  };

  const handleMintTestSOL = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setStatus("Minting 1000 SOL into your wallet...");

      // Use fetch to call the airdrop RPC endpoint
      const response = await fetch(
        `https://rpc.test.honeycombprotocol.com/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "requestAirdrop",
            params: [wallet.publicKey.toString(), 1000 * 1e9], // Amount in lamports
            id: 1,
            jsonrpc: "2.0",
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      setStatus(
        `Airdrop successful! Transaction ID: ${result.result}. Refresh your wallet balance to see the updated amount.`
      );
    } catch (error) {
      console.error("Error minting test SOL:", error);
      setStatus(`Error minting test SOL: ${error.message}`);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Page - Project Management</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Page - Mint Test SOL</h1>
      </header>

      <main className="flex-grow p-6">
        <div className="mb-6">
          <button
            onClick={handleMintTestSOL}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Mint Test SOL
          </button>
        </div>

        {status && <p className="my-4 p-3 bg-gray-800 rounded">{status}</p>}
      </main>

      <footer className="bg-black text-center py-4 mt-auto">
        <p>&copy; 2024 DD Gaming</p>
      </footer>
    </div>

      <main className="flex-grow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Create Project</h2>
          <input 
            type="text" 
            className="bg-gray-800 p-2 rounded w-full mb-2"
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)} 
            placeholder="Enter project name" 
          />
          <button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2">
            Create Project
          </button>
          {projectAddress && <p>Project Address: {projectAddress}</p>}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Profile Tree & Assembler Config</h2>
          <button onClick={handleCreateProfileTree} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-2">
            Create Profile Tree
          </button>
          <button onClick={createAssemblerConfig} className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
            Create Assembler Config
          </button>
          {assemblerConfigAddress && <p>Assembler Config Address: {assemblerConfigAddress}</p>}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User & Project Management</h2>
          <button onClick={fetchUsers} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded mr-2">
            Fetch Users
          </button>
          <button onClick={fetchProjectAddresses} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
            Fetch Project Addresses
          </button>
          <button onClick={findUserProjectAssociation} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded ml-2">
            Find User Project Association
          </button>
        </div>

        {status && <p className="my-4 p-3 bg-gray-800 rounded">{status}</p>}
        {signature && <p>Transaction Signature: {signature}</p>}

        {users.length > 0 && (
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <ul className="space-y-2">
              {users.map((user, index) => (
                <li key={index} className="bg-gray-800 p-3 rounded">
                  <p><strong>Name:</strong> {user.info.name}</p>
                  <p><strong>Bio:</strong> {user.info.bio}</p>
                  {/*<p><strong>PFP:</strong> <img src={user.info.pfp} alt="PFP" width="50" height="50" /></p>*/}
                </li>
              ))}
            </ul>
          </div>
        )}
<div className="mb-6">
  <h2 className="text-xl font-semibold mb-2">Create Gamer Token Resource</h2>
  <button 
    onClick={handleCreateGamerTokenResource} 
    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
  >
    Create Gamer Token Resource
  </button>
  {gamerTokenMintAddress && <p>Gamer Token Mint Address: {gamerTokenMintAddress}</p>}
</div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Create Resource Tree</h2>
              <button onClick={handleCreateResourceTree} className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
                Create Resource Tree
              </button>
              {treeAddress && <p>Resource Tree Address: {treeAddress}</p>}
            </div>

        {projects.length > 0 && (
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-2">Associated Projects</h2>
            <ul className="space-y-2">
              {projects.map((address, index) => (
                <li key={index} className="bg-gray-800 p-3 rounded">{address}</li>
              ))}
            </ul>
          </div>
        )}

        {userProjectAssociations.length > 0 && (
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-2">User Project Associations</h2>
            <ul className="space-y-2">
              {userProjectAssociations.map((association, index) => (
                <li key={index} className="bg-gray-800 p-3 rounded">
                  <p><strong>Project ID:</strong> {association.projectId}</p>
                  <p><strong>Profile Name:</strong> {association.profileInfo.name}</p>
                  <p><strong>Profile Bio:</strong> {association.profileInfo.bio}</p>
                  {/*<p><strong>Profile PFP:</strong> <Image src={association.profileInfo.pfp} alt="PFP" width="50" height="50" /></p>*/}
                </li>
              ))}
            </ul>
          </div>

          
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-center py-4 mt-auto">
        <p>&copy; 2024 DD Gaming</p>
      </footer>
    </div>
  );
};



export default AdminPage;
function setGamerTokenMintAddress(resourceAddr: string) {
  throw new Error('Function not implemented.');
}

