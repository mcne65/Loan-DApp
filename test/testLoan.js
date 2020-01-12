const Loan = artifacts.require("Loan");
const BN = require('bignumber.js');
const utils = require("./helpers/utils");

contract("Loan", (accounts) => {

  const amount = new BN(100);
  const [owner, recipient1, recipient2, recipient3] = accounts;
  const zeroAdd = 0x0000000000000000000000000000000000000000;
  const interest = new BN(5000000000000000000);
  const loanPeriod = 5;
  const borrower = accounts[1];
  const depositPercentage = 25;
  let contractInstance;

  const { toWei } = web3.utils;

  beforeEach("Create new contract instance", async () => {
    contractInstance = await Loan.new({ from: owner});
  });

  describe("Testing contract owner", function() {

    it("The deployer should be owner", async () => {
      const contractOwner = await contractInstance.getOwner({from: owner});

      assert.strictEqual(
        contractOwner,
        owner,
        "Msg.sender is not Owner");
    });
  });

  describe("Testing createLoan()", () => {

    it("Should successfully create a Loan", async () => {

      const CreateLoanResult = await contractInstance.createLoan(
        interest,
        loanPeriod,
        borrower,
        depositPercentage,
        {from: owner, value: amount});

      assert.isTrue(
        CreateLoanResult.receipt.status,
         "Status is false"
      );

      assert.strictEqual(
        CreateLoanResult.receipt.logs[0].event,
        "LogLoanCreation",
        "Event was not emitted correctly"
      );

      assert.strictEqual(
        CreateLoanResult.receipt.logs[0].args.__length__,
        2,
        "Should expect 2 events to be emitted"
      );

      assert.strictEqual(
        CreateLoanResult.receipt.logs[0].args._loanId.toString(10),
        "1",
        "loanId counter did not increment"
      )

      assert.strictEqual(
        CreateLoanResult.receipt.logs[0].args._lender,
        owner,
        "Lender should be owner"
      )

    });
  });

  describe("Testing createLoan failures", () => {
    
    it("Should throw if borrower is a 0 address", async () => { 
      await utils.shouldThrow(
        contractInstance
        .createLoan(
        interest,
        loanPeriod,
        zeroAdd,
        depositPercentage,
        {from: owner, value: amount})
        );
    });

    it("Should throw if msg.value is less than 0", async () => {
      await utils.shouldThrow(
        contractInstance
        .createLoan(
        interest,
        loanPeriod,
        borrower,
        depositPercentage,
        {from: owner, value: 0 })
        );
    });

    it("Should throw if msg.value is less than 0", async () => {
      await utils.shouldThrow(
        contractInstance
        .createLoan(
        interest,
        loanPeriod,
        borrower,
        depositPercentage,
        {from: owner, value: 0 })
      );
    });
    
    it("Should throw when contract is paused", async () => {

      const paused = await contractInstance.stop({from: owner});

      assert.strictEqual(
        paused.receipt.logs[0].event,
        "LogStopped",
        "Event was not emitted correctly"
      );

      await utils.shouldThrow(
        contractInstance
        .createLoan(
        interest,
        loanPeriod,
        borrower,
        depositPercentage,
        {from: owner, value: amount})
      );
    });

    it("Should throw when contract is killed", async () => {
      
      const paused = await contractInstance.stop({from: owner});
      assert.strictEqual(paused.receipt.logs[0].event, "LogStopped", "Event was not emitted correctly");

      const killed = await contractInstance.kill({from: owner});
      assert.strictEqual(killed.receipt.logs[0].event, "LogKilled", "Event was not emitted correctly");

      await utils.shouldThrow(contractInstance.createLoan(
        interest,
        loanPeriod,
        borrower,
        depositPercentage,
        {from: owner, value: amount}));

    });


    describe("Testing payLoanDeposit()", () => {

      it("Should  pay a loan deposit and retrieve funds", async () => {

        // console.log(balance)
        // The balance starts at 100
        // Create a Loan
        const CreateLoanResult = await contractInstance.createLoan(
          interest,
          loanPeriod,
          borrower,
          depositPercentage,
          {from: owner, value: toWei("20", "ether")});
          console.log(CreateLoanResult)
        // assert.isTrue(
        //   CreateLoanResult.receipt.status,
        //    "Status is false"
        // );
        // // After the Loan is made the balance drops down the 79 including gas fees

        // const retrievedLoan = await contractInstance.retrieveLoans(1, {from: owner});
        // console.log(retrievedLoan.fullAmount.toString(10))
        // assert.strictEqual(
        //   retrievedLoan.status.toString(10),
        //    "0",
        //    "Loan status is not PENDING"
        //   );

        // assert.strictEqual(
        //   retrievedLoan.requiredDeposit.toString(10),
        //   "5000000000000000000",
        //   "Did not calculate 25% of 20 correctly"
        // );

        // assert.strictEqual(
        //   retrievedLoan.fullAmount.toString(10),
        //   "20000000000000000000",
        //   "Full amount of loan is incorrect"
        // );

          
        // // We console log the retrieved Loan to make sure it has been created

        // // console.log(CreateLoanResult.receipt.logs[0]._loanId)
        // assert.strictEqual(
        //   CreateLoanResult.receipt.logs[0].args._loanId.toString(10),
        //   "1",
        //   "loanId counter did not increment"
        // // );
          
        // // Pay loan deposit with borrower address
        // const paidDeposit = await contractInstance.payLoanDeposit(1, {from: borrower, value: toWei("5", "ether")})
      
        // // assert.strictEqual(
        // //   paidDeposit.receipt.status,
        // //   true,
        // //   "Status is false"
        // // );

        // // assert.strictEqual(
        // //   paidDeposit.receipt.logs[0].event,
        // //   "LogDeposit",
        // //   "Event was not emitted correctly"
        // // );
        
        // // assert.strictEqual(
        // //   paidDeposit.receipt.logs[0].args.__length__.toString(10),
        // //   "2",
        // //   "Should expect 2 events to be emitted"
        // // );
      
        // const retrieve = await contractInstance.retrieveLoanFunds(1, {from: borrower})
        // var balance = await web3.eth.getBalance(borrower)
        // console.log(balance)
        // Borrower retrieves funds from loan
        // const retrieveFunds =  await contractInstance.retrieveLoanFunds.call(1, {from: borrower});
        // assert.strictEqual(retrieveFunds, "Funds were not retrieved successfully");
        // console.log(retrieveFunds)
      });

      xit("tes test", async () => {
        
        
        // const startBalance = new BN(await web3.eth.getBalance(borrower, {from:owner}));

        // const CreateLoanResult = await contractInstance.createLoan(
        //   interest,
        //   loanPeriod,
        //   borrower,
        //   depositPercentage,
        //   {from: owner, value: toWei("20", "ether")});
  
        // // Pay loan deposit with borrower address
        // const paidDeposit = await contractInstance.payLoanDeposit(1, {from: borrower, value: toWei("5", "ether")})
        // assert.equal(paidDeposit.receipt.status, true, "Status is false");
        // //console.log(paidDeposit)
        // const retrieve = await contractInstance.retrieveLoanFunds.call(1, {from: borrower})


        // const hash = txObj.receipt.transactionHash; // Get tx hash for gas used.
        // const tx = await web3.eth.getTransaction(hash); //Returns a transaction matching the given transaction hash.
        // const gasUsed = txObj.receipt.gasUsed;
        // const gasPrice = tx.gasPrice;
        // const txFee = new BN(gasUsed * gasPrice);
        // const balanceNow = new BN(await web3.eth.getBalance(bob));        
        // const receiveAmount = 500;
  
        // assert.equal(balanceNow.toString(10), startBalance.plus(receiveAmount).minus(txFee).toString(10), "Bob's balance did not return as intended");
      });

    });

  });

});
