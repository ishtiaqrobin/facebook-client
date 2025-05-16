import { createServer } from 'http';
import next from 'next';

const port = process.env.PORT || 3000; // cPanel PORT priority
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => {
        handle(req, res);
    }).listen(port, '0.0.0.0', (err) => {
        if (err) throw err;
        console.log('> Ready on http://0.0.0.0:' + port);
    });
});
