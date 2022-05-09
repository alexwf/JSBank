const Account = require('../Models/Account');
let accounts = [];

class AccountController {
    /**
     * Home page
     * @returns json welcome to jsbank and status 200
     */
    index (req, res) {
        return res.status(200).json("Welcome to JSBank");
    }

    /**
     * Clear data of all accounts
     * @returns status 200
     */
    reset(req, res) {
        accounts = [];
        return res.sendStatus(200);
    }

    /**
     * Return the balance
     * @returns json balance and status 200 or 404
     */
    getBalance(req, res) {
        const { account_id } = req.query;
        let balance;

        //Get all accounts
        if (account_id == undefined) {
            return res.status(200).json(accounts);
        }

        //Get only the filtered account
        const filterAccount = accounts.filter(account => {
            if (typeof account[account_id] != "undefined" ) {
                balance = account[account_id].balance;
                return account;
            }
        });

        //Check if account exists
        if (filterAccount.length > 0) {
            return res.status(200).json(balance);
        }
        return res.status(404).json(0);
    }

    /**
     * Create transactions events (req: deposit, withdraw, transfer)
     * @returns json and status 201 or 404
     */
    event(req, res) {
        const { type, origin, amount, destination } = req.body ;
        let jsonObj;

        //Origin
        const filterAccountOrigin = accounts.filter(account => {
            if (typeof account[origin] != "undefined") {
                if (type == "withdraw" || type == "transfer") {
                    account[origin].balance -= amount;
                    return account;
                }
            }
        });

        //Destination
        const filterAccount = accounts.filter(account => {
            if (typeof account[destination] != "undefined") {
                account[destination].balance += amount;
                return account;
            }
        });
        
        //Create a new account
        if (filterAccount.length == 0 && (type == "deposit" || type == "transfer")) {
            let account = new Account(destination, amount);
            accounts.push({[destination]:account});
            filterAccount.push({[destination]: {
                id: destination, balance: amount
            }});
        }

        //Send new balance and status
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