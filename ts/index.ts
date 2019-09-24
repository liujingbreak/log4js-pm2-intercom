import pm2 from 'pm2';
import * as _ from 'lodash';
import {promisify as pify} from 'util';

const connect = pify(pm2.connect.bind(pm2));
const list = pify(pm2.list.bind(pm2));
const launchBus = pify(pm2.launchBus.bind(pm2));

export async function start() {
	console.log('start pm2-intercom');
	await connect();
	const apps: pm2.ProcessDescription[] = await list();
	console.log(apps.map(pc => pc.name + ': ' + pc.pm_id))
	const bus = await launchBus();

	const targets = new Map<string, number>();


	bus.on('process:msg', (packet: any) => {
		// console.log(JSON.stringify(packet, null, '  '));
		const topic: string = _.get(packet, 'raw.topic');
		const name: string = _.get(packet, 'process.name');
		if (topic === 'log4js:master') {
			targets.set(name, packet.process.pm_id);
			console.log('--- App master process start ---\n', targets);
		}
		if (topic !== 'log4js:message')
			return;
		let masterProcId = targets.get(name);
		if (masterProcId)
			pm2.sendDataToProcessId(masterProcId, packet.raw, () => {});
	});
}
