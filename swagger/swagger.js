const swaggerJSDoc = require('swagger-jsdoc');

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Authentication API',
            version: '1.0.0',
            description: 'A simple authentication API with Node.js, Express, and MongoDB',
        },
        servers: [
            // {
            //     url: 'http://localhost:3000',
            //     description: 'Development server',
            // },
            {
                url: 'https://nodejs-auth-apis-i66p.onrender.com/',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routes/*.js', './models/*.js'],
};

module.exports = swaggerJSDoc(swaggerOptions);
