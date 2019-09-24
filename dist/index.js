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
const pm2_1 = require("pm2");
const _ = require("lodash");
const util_1 = require("util");
const connect = util_1.promisify(pm2_1.default.connect.bind(pm2_1.default));
const list = util_1.promisify(pm2_1.default.list.bind(pm2_1.default));
const launchBus = util_1.promisify(pm2_1.default.launchBus.bind(pm2_1.default));
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
                pm2_1.default.sendDataToProcessId(masterProcId, packet.raw, () => { });
        });
    });
}
exports.start = start;
//# sourceMappingURL=index.js.map