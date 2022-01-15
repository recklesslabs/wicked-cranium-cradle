# Wicked Cranium Cradle

**Project outline**: Wicked Craniums (WC) are a collection of 10,768 NFTs on the 
ethereum blockchain. Each NFT represents a unique work of art. A person's wallet
address can hold 0 or more such NFTs. The _Cradle_ aims to be a social platform
for holders of the Wicked Cranium NFTs. People can login using their wallet
(they can only login if they hold one or more WCs). Once logged in, they can
post a Bio (Story) for each of their WCs and view other Bios. They can also give
a name to each WC they own and add a link to their social media.

**Technical outline**: The project is built using Angular 12, uses Firebase as
the backend database, and uses the `web3` library to verify NFT ownership from
their wallet. We use Angular Material as the UI library. Some nice features
include **real time** UI updates, and **infinite animated scrolling**. 

**Commands**: The project was generated with Angular CLI so expect the usual
commands. `npm i` to  download the packages, `ng serve` to serve to
`http://localhost:4200/`, `ng build` to build into `dist/wicked-cranium-cradle`
and `firebase deploy` to deploy to firebase. 

**Cradle Revamp**: Take a look at the google doc for what needs to be done next.
