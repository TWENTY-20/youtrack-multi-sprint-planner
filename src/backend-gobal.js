

// eslint-disable-next-line no-undef,@typescript-eslint/no-unsafe-member-access
exports.httpHandler = {
    endpoints: [
        {
            method: 'POST',
            path: 'test1',
            handle: (ctx) => {
                ctx.globalStorage.extensionProperties.selectedCustomFields = 'test1'
                ctx.response.json({succes: true})
            }
        },
        {
            method: 'GET',
            path: 'test2',
            handle: (ctx) => {
                const t = ctx.globalStorage.extensionProperties.selectedCustomFields
                ctx.response.json(JSON.parse(JSON.stringify(t)))
            }
        }
    ]
};

