const DB = require('../data/dbConfig');
const { deleteImageS3 } = require('../utils/s3');


async function removePastEvents() {
    try {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];

        const pastEvents = await DB('events')
            .where('eventdate', '<', currentDate)
            .select(
                [
                    'events.id',
                    'events.eventmedia'
                ]
            )

        const event_ids = pastEvents.map(event => event.id);
        const media_keys = pastEvents.map(event => event.eventmedia);

        if (media_keys.length !== 0) {
            await Promise.all(media_keys.map(async image_key => {
                return deleteImageS3(image_key)
            }))
        }

        if (event_ids.length !== 0) {
            await DB('events')
                .whereIn('events.id', event_ids)
                .del()
        }

        console.log(`${(event_ids.length !== 0) ? `${event_ids.length}` : 'No'} event(s) prior to today (${currentDate}) removed`)
    } catch (error) {
        console.error(`Error deleting past events: `, error);
    }
}

module.exports = { removePastEvents };