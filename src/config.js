// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,
 
    intentMap: {
       'AMAZON.StopIntent': 'END',
       'AMAZON.FallbackIntent': 'FallbackIntent'
    },
 
    db: {
         FileDb: {
             pathToFile: '../db/db.json',
         }
     },

     cms: {
        GoogleSheetsCMS: {
            spreadsheetId: '1sBMAepx5JS_35CvV44BCsweZi-5AGAxD-7vvGLKxAh0',
            access: 'private',
            credentialsFile: './credentials/creds.json',
            sheets: [
                {
                    name: 'birthdays',
                    position: 1,
                },
                {
                    name: 'questions',
                    position: 2,
                },
                {
                    name: 'announcements',
                    range: 'A:Z',
                    position: 3,
                },
                {
                    name: 'challenge',
                    position: 4,
                },
                {
                    name: 'responses',
                    type: 'Responses',
                    position: 5,
                },
                {
                    name: 'teachers',
                    position: 6,
                },
                {
                    name: 'classes',
                    position: 7,
                },
                {
                    name: 'quiz',
                    position: 8,
                },
            ]
        }
    },
 };
 