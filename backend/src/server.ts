import { Product } from './models/product.model';
import express, { Application , Request, Response } from 'express';
import morgan from 'morgan';
import { UserController } from './controllers/user.controller';
import { Sequelize } from 'sequelize';
import { User } from './models/user.model';
import { Transaction } from './models/transaction.model';
import { TransactionController } from './controllers/transaction.controller';
import cors from 'cors';
import { ProductController } from './controllers/product.controller';
import { ProductImage } from './models/productimage.model';

export class Server {
    private server: Application;
    private sequelize: Sequelize;
    private port = process.env.PORT || 3000;

    constructor() {
        this.server = this.configureServer();
        this.sequelize = this.configureSequelize();

        // create tables (if they do not already exist)
        User.initialize(this.sequelize);
        Product.initialize(this.sequelize);
        Transaction.initialize(this.sequelize);
        ProductImage.initialize(this.sequelize);
        User.createAssociations();
        Product.createAssociations();
        Transaction.createAssociations();
        ProductImage.createAssociations();
    }

    private configureServer(): Application {
        // options for cors middleware
        const options: cors.CorsOptions = {
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true,
            methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
            origin: `http://localhost:${this.port}`,
            preflightContinue: false,
        };

        return express()
            .use(cors())
            .use(express.json())                    // parses an incoming json to an object
            .use(morgan('tiny'))                    // logs incoming requests
            .use('/user', UserController)
            .use('/products', ProductController)
            .use('/transaction', TransactionController)
            .options('*', cors(options))
            .use(express.static('./src/public'))
            // this is the message you get if you open http://localhost:3000/ when the server is running
            .get('/', (req, res) => res.send('<h1>Welcome to the ESE-2020 Backend Scaffolding <span style="font-size:50px">&#127881;</span></h1>'));
    }

    private configureSequelize(): Sequelize {
        console.log(process.env.NODE_ENV);
        if (process.env.NODE_ENV === 'test') {
            return new Sequelize({
                dialect: 'sqlite',
                storage: ':memory:',
                logging: false
            });
        }
        return new Sequelize({
            dialect: 'sqlite',
            storage: 'db.sqlite',
            logging: false // can be set to true for debugging
        });
    }

    public start() {
        this.sequelize.sync().then(() => {                           // create connection to the database
            this.server.listen(this.port, () => {                                   // start server on specified port
                console.log(`server listening at http://localhost:${this.port}`);   // indicate that the server has started
            });
        });
    }

    public async getServer() {
        if (process.env.NODE_ENV === 'test') {
            await this.sequelize.sync();
            return this.server;
        }
        return this.server;
    }

}

const server = new Server();

export const applicationPromise = server.getServer(); // for test purposes only

if (process.env.NODE_ENV === 'local') {
    server.start(); // starts the server
}
