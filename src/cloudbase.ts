import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
    env: 'stroycraft-1ghmi4ojd3b4a20b',
    // clientId: '', // 如有需要可填写
});

const auth = app.auth();

export { app, auth }; 