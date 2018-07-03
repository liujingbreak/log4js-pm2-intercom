"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2 = require("pm2");
const _ = require("lodash");
const pify = require("pify");
const connect = pify(pm2.connect.bind(pm2));
const list = pify(pm2.list.bind(pm2));
const launchBus = pify(pm2.launchBus.bind(pm2));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start pm2-intercom');
        yield connect();
        const apps = yield list();
        console.log(apps.map(pc => pc.name + ': ' + pc.pm_id));
        const bus = yield launchBus();
        const targets = new Map();
        bus.on('process:msg', (packet) => {
            // console.log(JSON.stringify(packet, null, '  '));
            const topic = _.get(packet, 'raw.topic');
            const name = _.get(packet, 'process.name');
            if (topic === 'log4js:master') {
                targets.set(name, packet.process.pm_id);
                console.log('--- App master process start ---\n', targets);
            }
            if (topic !== 'log4js:message')
                return;
            let masterProcId = targets.get(name);
            if (masterProcId)
                pm2.sendDataToProcessId(masterProcId, packet.raw, () => { });
        });
    });
}
exports.start = start;
//# sourceMappingURL=index.js.map