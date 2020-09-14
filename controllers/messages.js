const fs = require('fs');

const db = require('../../ems-db');

const messages = {
    getMessages: (req, res, next) =>
        db.resolvers.messages
            .allMessages(req)
            .then((result) => {
                res.status(200);
                res.json(result.rows);
                next();
            })
            .catch(() => {
                res.status(500);
                res.send();
                next();
            }),
    upsertMessage: (req, res, next) =>
        // TODO: Ensure the message being edited belongs to the user
        db.resolvers.messages
            .upsertMessage(req)
            .then(async (result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else {
                    const message = result.rows[0];

                    // Make the message & associated query available
                    // to the websockets sending middleware
                    const query = await db.resolvers.queries.getQuery({
                        params: { id: message.query_id }
                    });
                    req.wsData = { message, queries: query.rows };

                    res.status(req.method === 'POST' ? 201 : 200);
                    res.json(message);
                    next();
                }
            })
            .catch((err) => next(err)),
    deleteMessage: (req, res, next) =>
        // TODO: Ensure the message being deleted belongs to the user
        //
        // First get the message that is about to be deleted and
        // check if it has a file attachment
        db.resolvers.messages
            .getMessage(req)
            .then((toDelete) => {
                if (toDelete.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (toDelete.rowCount === 1) {
                    // Populate the filename to be deleted
                    const delFilename = toDelete.rows[0].filename
                        ? toDelete.rows[0].filename
                        : null;
                    return db.resolvers.messages
                        .deleteMessage(req, toDelete.rows[0])
                        .then(async () => {
                            // Make the necessary data available to the
                            // websockets sending middleware
                            const query = await db.resolvers.queries.getQuery({
                                params: { id: toDelete.rows[0].query_id }
                            });
                            req.wsData = {
                                message: toDelete.rows[0],
                                queries: query.rows
                            };

                            // We need to delete any file attachment
                            // associated with this message
                            if (delFilename) {
                                fs.unlinkSync(
                                    `${process.env.UPLOADS_DIR}/${delFilename}`
                                );
                            }
                            res.status(204);
                            res.json({});
                            next();
                        })
                        .catch((err) => next(err));
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err))
};

module.exports = messages;
