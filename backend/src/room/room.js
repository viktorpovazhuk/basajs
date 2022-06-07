import * as fs from 'fs';
import { UserSpace } from '../user/user_space.js';
import path from 'node:path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Room {
    constructor(id, users) {
        this.id = id;
        this.users = [];
        this.playingUsers = [];
        users.forEach(u => {
            this.users.push(u);
            this.playingUsers.push(u);
        });
        this.state = 0;
    }

    isEnd() {
        this.playingUsers = this.playingUsers.filter(u => !u.won && u.hp > 0 && !u.hasDisconnected);
        return this.playingUsers.length <= 1;
    }

    endGame() {
        this.removeUsersFromSpace();
        this.saveResults();
    }

    saveResults() {
        let jsonObject = {
            users: this.users
        };
        let jsonData = JSON.stringify(jsonObject);
        fs.writeFile(path.join(__dirname, `../../results/${this.id}_results.json`), jsonData, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing results of game to file.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });
    }

    removeUsersFromSpace() {
        this.users.forEach(u => {
            UserSpace.removeUser(u.id);
        });
    }
}