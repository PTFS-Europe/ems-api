const db = require('../../ems-db');

const labels = {
    getLabels: (req, res, next) =>
        db.resolvers.labels
            .allLabels(req)
            .then((result) => {
                res.json(result.rows);
                next();
            })
            .catch((err) => {
                next(err);
            }),
    upsertLabel: (req, res, next) =>
        db.resolvers.labels
            .upsertLabel(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else {
                    res.status(req.method === 'POST' ? 201 : 200);
                    res.json(result.rows[0]);
                    // Make the label available to the websockets
                    // sending middleware
                    req.wsData = { label: result.rows[0] };
                    next();
                }
            })
            .catch((err) => next(err)),
    deleteLabel: async (req, res, next) => {
        const toDelete = await db.resolvers.labels.getLabel(req);
        return db.resolvers.labels
            .deleteLabel(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.status(204);
                    res.json({});
                    // Make the deleted label available to the websockets
                    // sending middleware
                    req.wsData = { label: toDelete.rows[0] };
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err));
    }
};

module.exports = labels;
