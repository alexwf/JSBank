const Account = require('../Models/Account');
let accounts = [];

class AccountController {
    /**
     * Home page
     * @returns json | welcome to jsbank and status 200
     */
    index(req, res) {
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
     * @returns json | balance and status 200 or 404
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
            if (typeof account[account_id] != "undefined") {
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
     * @returns json | object from account changed (deposit, withdraw, transfer) and status 201 or 404
     */
    event(req, res) {
        const { type, origin, amount, destination } = req.body;

        const filterAccountOrigin = this.executeEvent(
            origin,
            amount,
            type,
            "origin"
        );

        const filterAccountDestination = this.executeEvent(
            destination,
            amount,
            type,
            "destination",
            filterAccountOrigin.length > 0
        );

        if (
            filterAccountDestination.length == 0
            && (type == "deposit" || type == "transfer")
        ) {
            filterAccountDestination.push(
                this.createAccount(destination, amount)
            );
        }

        const accountObject = {
            type: type,
            origin: filterAccountOrigin,
            destination: filterAccountDestination,
            idOrigin: origin,
            idDestination: destination,
            res
        };
        return this.getResponse(accountObject);
    }

    /**
     * @returns object | from account changed
     */
    executeEvent(id, amount, type, where, originExist) {
        return accounts.filter(account => {
            if (typeof account[id] != "undefined") {
                if (
                    where == "origin"
                    && (type == "withdraw" || type == "transfer")
                ) {
                    account[id].balance -= amount;
                } else if (originExist || type == "deposit"){
                    account[id].balance += amount;
                }
                return account;
            }
        });
    }

    /**
     * @returns object | new account created
     */
    createAccount(destination, amount) {
        let account = new Account(destination, amount);
        accounts.push({ [destination]: account });
        return {
            [destination]: {
                id: destination, balance: amount
            }
        };
    }

   /**
    * @returns object | new balance and status
    */
    getResponse(obj) {
        const { type, origin, destination, idOrigin, idDestination, res } = obj;

        let jsonObj;

        if (type == "deposit") {
            jsonObj = {
                destination: destination[0][idDestination]
            };
        } else if (type == "withdraw" && origin[0] != undefined) {
            jsonObj = {
                origin: origin[0][idOrigin]
            };
        } else if (type == "transfer" && origin[0] != undefined) {
            jsonObj = {
                origin: origin[0][idOrigin],
                destination: destination[0][idDestination]
            };
        } else {
            return res.status(404).json(0);
        }
        return res.status(201).json(jsonObj);
    }    
}

module.exports = new AccountController();