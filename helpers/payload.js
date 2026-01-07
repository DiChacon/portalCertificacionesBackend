import jwt from 'jsonwebtoken';
import fs from 'fs';

class Payload {

    constructor(){
        this.privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
        this.publicKey = fs.readFileSync(process.env.PUBLIC_KEY, 'utf8');
    }

    createToken(payload){

        return jwt.sign(payload, this.privateKey, {
            algorithm: 'RS256',
            expiresIn: '24h',
        });
    }

    createNewPassword(user_id){
        return jwt.sign({user_id}, this.privateKey, {
            algorithm: 'RS256',
        });
    }
}

export const tokenMiddleware = new Payload();