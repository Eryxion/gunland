const Sequelize = require('sequelize');
let mysql = require('mysql2');

global.connection_type = 'remote'; // setează remote pentru a nu mai folosi localhost

global.sequelize = new Sequelize('eryxion', 'root', 'madalina12', {
    host: '86.104.211.214',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    operatorsAliases: 0,
    logging: false,
    // dialectOptions: { socketPath: '/var/run/mysqld/mysqld.sock' }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
