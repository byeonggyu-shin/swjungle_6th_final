const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        // ['/api/login', '/api/users/me'],
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true
        })
    );
};