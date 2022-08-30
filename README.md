# What is KonnectHealth?

This project built a proof-of-concept decentralised app, KonnectHealth, that collects and integrates health data from different sources more seamlessly, transparently, and accurately than existing record linkage methods. The sources of data used include those that may be routinely linked, including hospital, GP, and clinical trial data. In implementing KonnectHealth for the purpose of record linkage, this project also integrated research tools that expose no patient data, and discovered a method of clinical trial adverse events reporting which may potentially be more reliable and efficient than existing methods.


# Before starting the KonnectHealth app...

Download Ganache.

The project is set to deploy to Ganache by default.

If you would like to use something else, modify the existing Truffle config file.

Install MetaMask wallet in google chrome browser. Ensure it is connected locally to where Ganache is running.

Install the required dependencies

## Locally deploy the contracts

```sh
$ cd truffle
$ npx truffle migrate --reset
  
```

Check Ganache to ensure contract has deployed

## Import wallet

Connect a Ganache account to MetaMask by importing it

## Start the server

Start the react dev server.

```sh
$ cd client
$ npm start
  Starting the development server...
```

NOTE: must open the development server in google chrome

From there, follow the instructions on the KonnectHealth app. 


## 

This is built from a box combination of [Truffle](https://trufflesuite.com) and [Create React App](https://create-react-app.dev). 
