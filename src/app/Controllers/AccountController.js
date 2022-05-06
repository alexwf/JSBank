const Account = require('../Models/Account');
let accounts = [
    {
        "100": {
            "id": "100",
            "balance": 12
        }
    },
    {
        "101": {
            "id": "101",
            "balance": 13
        }
    },
    {
        "103": {
            "id": "103",
            "balance": 14
        }
    }
];

class AccountController {

    reset(req, res) {
        accounts = [];
        return res.sendStatus(200);
    }

    getBalance(req, res) {
        const { account_id } = req.query;
        let balance;

        if (account_id == undefined) {
            return res.status(200).json(accounts);
        }

        const filterAccount = accounts.filter(account => {
            if (typeof account[account_id] != "undefined" ) {
                balance = account[account_id].balance;
                return account;
            }
        });

        if (filterAccount.length > 0) {
            return res.status(200).json(balance);
        }
        return res.status(404).json(0);
    }

   

    store(req, res) {
        const { destination, amount } = req.body ;
        
        let account = new Account(destination, amount);
        accounts.push({[destination]:account});
        return res.status(201).json({"destination": account});
    }
}

module.exports = new AccountController();