const { handler } = require('./index.js');

async function test() {
    const result = await handler();
    console.log(result);
}

test();
