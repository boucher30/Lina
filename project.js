// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {

    alexaSkill: {
        nlu: 'alexa',
        manifest: {
            apis: {
                custom: {
                    interfaces: [
                        {
                            type: 'AUDIO_PLAYER'
                        }
                    ]
                }
            }
        }
    },
    //arn:aws:lambda:us-east-1:670378695665:function:Lina
    endpoint: 'arn:aws:lambda:us-east-1:670378695665:function:Lina'
};
 