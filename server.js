const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const knex = require('knex');
require('dotenv').config();

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
})

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('up and running');
});

app.post('/signin', (req, res) => {
    db.select('email' , 'hash').from('login')
    .where('email','=',req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
            return db.select('id').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.header("Access-Control-Allow-Origin", "*");
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { name, lname, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 18);
    const timestamp = new Date();

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                lastname: lname,
                created_at: timestamp,
                updated_at: timestamp
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
})

app.get('/getTotalCurrency/', (req, res) => {
    const { id } = req.body;

    if(isNaN(id)) {
        return res.status(400).json('not a user')
    } else {
        db.select('currency').from('users')
        .where("id", "=", id)
        .then(currency => {
            if(user.length) {
                res.json(currency);
            } else {
                res.status(400).json('user not found');
            }
        })
    }
})

app.get('/profile/', (req, res) => {
    const { id } = req.body;
    db.select('*').from('users')
    .where({id})
    .then(user => {
        if(user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('user not found');
        }
    })
})

app.post('/updateBalance', (req, res) => {
    const { user_id, currency } = req.body;
    const timestamp = new Date();

    if(user_id == NaN) {
        return res.status(200).json('Not a user')
    } else 
    {
        db.select('balance').from('users')
        .where("id","=",user_id)
        .then(balance => {
            new_balance = parseInt(currency) + parseInt(balance[0].balance);
            return new_balance;
        })
        .then(new_balance => {
            db('users')
            .where('id','=',user_id)
            .update({
                balance: new_balance,
                updated_at: timestamp   
            })
            .then(updated_user => {
                res.json('Success updating balance on user ' + user_id)
            }
            )
        })
        .catch(err => res.status(500).json('error updating balance ' + err))

    }
})

app.get('/getTransactions/:user_id', (req, res) => {
    const { user_id } = req.params;
    var user_transactions = [];
    var user_name = "";
    var user_balance = "";
    var valid_codes = [];
    db.select('title','amount')
    .from('transactions')
    .where('user_id','=' ,user_id)
    .then(transactions => {
        user_transactions = transactions;
    })
    .then(() => {
        db.select('name','lastname','balance')
        .from('users')
        .where('id','=' ,user_id)
        .then(user => {
            user_name = user[0].name + ' ' + user[0].lastname;
            user_balance = user[0].balance;
        })
        .then(() => {
           db.select("*")
           .from('valid_codes')
           .then(db_valid_codes => {
                valid_codes = db_valid_codes;
           })
           .then(() => {
                res.json({
                    name: user_name,
                    balance: user_balance,
                    transactions: user_transactions,
                    valid_codes: valid_codes
                })
           })
        }
        )
    })
    .catch(err => res.json("error"+err.message))
   
})

app.post('/registerTransaction', (req, res) => {
    const { user_id, valid_code_id, title, amount } = req.body;
    const timestamp = new Date();

    db.transaction(trx => {
        trx.insert({
            user_id: user_id,
            title: title,
            amount: amount,
            valid_code_id, valid_code_id,
            date_time: timestamp
        })
        .into('transactions')
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {

        db.select('balance').from('users')
        .where("id","=",user_id)
        .then(balance => {
            current_balance = parseInt(balance[0].balance);
            add_amount = parseInt(amount);
            new_balance = current_balance + add_amount;
            return new_balance;
        })
        .then(new_balance => {
            db('users')
            .where('id','=',user_id)
            .update({
                balance: new_balance,
                updated_at: timestamp   
            })
            .then(() => {
                res.json('Success updating balance and creating transaction on user ' + user_id)
            }
            )
        })
        .catch(err => res.status(500).json('error updating balance ' + err))
    })
    .catch(err => res.status(500).json('error at inserting transaction ' + err))
})

app.get('/getCodesUsed', (req, res) => {

    const { user_id } = req.body;

    db('transactions')
    .join('valid_codes', 'transactions.valid_code_id','=','valid_codes.id')
    .select('valid_codes.code', 'valid_codes.description')
    .where('transactions.user_id','=',user_id)
    .then(visitedCodes => {
        res.json(visitedCodes)
    })
    .catch(err => res.status(500).json('Error while getting user visited codes on user ' + user_id + ': ' + err.message))
})

app.get('/getUsersInfo', (req, res) => {
    db.select('name','balance','email','id')
    .from('users')
    .then(users => {
        return res.json(users);
    });
})

app.get('/getValidCodes', (req, res) => {
    db.select('*')
    .from('valid_codes')
    .then(codes => {
        return res.json(codes);
    })
})

app.get('/', (req, res) => {
    res.json('it liveeeees')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`server running on port ${process.env.PORT}`);
})

