const Account = require('../Models/Account');
let accounts = [];

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

    event(req, res) {
        const { type, origin, amount, destination } = req.body ;
        let jsonObj;

        /* ORIGIN */
        const filterAccountOrigin = accounts.filter(account => {
            if (typeof account[origin] != "undefined") {
                if (type == "withdraw" || type == "transfer") {
                    account[origin].balance -= amount;
                    return account;
                }
            }
        });

        /* DESTINATION */
        const filterAccount = accounts.filter(account => {
            if (typeof account[destination] != "undefined") {
                account[destination].balance += amount;
                return account;
            }
        });
        
        if (filterAccount.length == 0 && (type == "deposit" || type == "transfer")) {
            let account = new Account(destination, amount);
            accounts.push({[destination]:account});
            filterAccount.push({[destination]: {
                id: destination, balance: amount
            }});
        }

        if (type == "deposit") {
            jsonObj = {
                destination: filterAccount[0][destination]
            };
        } else if (type == "withdraw" && filterAccountOrigin[0] != undefined) {
            jsonObj = {
                origin: filterAccountOrigin[0][origin]
            };
        } else if (type == "transfer" && filterAccountOrigin[0] != undefined) {
            jsonObj = {
                origin: filterAccountOrigin[0][origin],
                destination: filterAccount[0][destination]
            };
        } else {
            return res.status(404).json(0); 
        }        
        return res.status(201).json(jsonObj);        
    }
}

module.exports = new AccountController();