// The thing we're testing
const queries = require('../../controllers/queries');

// The DB module that queries.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = {
    id: 1,
    initiator: 1,
    labels: [1],
    latestMessage: {
        query_id: 1
    },
    participants: [1]
};

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        queries: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allQueries: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            getQuery: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            upsertQuery: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            deleteQuery: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver that returns an array of promises,
            // each resolving to what was passed
            updateBulk: jest.fn((passed) => {
                if (passed) {
                    return passed.map((passedItem) => {
                        return new Promise((resolve) => {
                            return resolve(passedItem);
                        });
                    });
                } else {
                    // Return an array containing 3 promise rejections
                    return [1, 2, 3].map(() => {
                        return new Promise((resolve, reject) => {
                            return reject(new Error('Rejected'));
                        });
                    });
                }
            }),
            // A mock DB resolver for initiators that returns a mock initiator
            initiators: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({ rows: [{ id: 1, initiator: 1 }] });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for participants that returns a mock
            // participant
            participants: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({
                            rows: [{ query_id: 1, creator_id: 1 }]
                        });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for latest messages that returns a mock
            // object
            latestMessages: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({ rows: [{ query_id: 1 }] });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for labels that returns a mock
            // object
            labels: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({
                            rows: [{ query_id: 1, label_id: 1 }]
                        });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            })
        }
    }
}));

describe('Queries', () => {
    describe('getQueries', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();
        // Our expected response
        const response = [
            {
                id: 1,
                initiator: 1,
                participants: [1],
                labels: [1],
                latestMessage: { query_id: 1 }
            }
        ];

        const emptyResponse = [];

        // Make the call
        queries.getQueries({ rows: [{ id: 1 }] }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.queries.allQueries).toHaveBeenCalled();
            done();
        });
        it('should call the initiators resolver', (done) => {
            expect(db.resolvers.queries.initiators).toHaveBeenCalled();
            done();
        });
        it('should call the participants resolver', (done) => {
            expect(db.resolvers.queries.participants).toHaveBeenCalled();
            done();
        });
        it('should call the latest resolver', (done) => {
            expect(db.resolvers.queries.latestMessages).toHaveBeenCalled();
            done();
        });
        it('should call res.json with the correct response', (done) => {
            expect(res.json).toHaveBeenCalledWith(response);
            done();
        });
        it('should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        queries.getQueries(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });

        // Make a call that results in no queries
        queries.getQueries({ rows: [] }, res, next);
        it('a call that returns no queries should return an empty array', (done) => {
            expect(res.json).toHaveBeenCalledWith(emptyResponse);
            done();
        });
    });
    describe('getQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();
        // Our expected response
        const response = {
            id: 1,
            initiator: 1,
            participants: [1],
            labels: [1],
            latestMessage: { query_id: 1 }
        };

        // Make the === 0 (else) call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 1 result
        queries.getQuery({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.queries.getQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the === 1 call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 1 result
        queries.getQuery({ rowCount: 1, rows: [{ id: 1 }] }, res, next);

        it('rowCount === 1 should call json(), passing the result', (done) => {
            expect(res.json).toBeCalledWith(response);
            done();
        });
        it('rowCount === 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 3 results
        queries.getQuery({ rowCount: 3 }, res, next);

        it('rowCount > 1 should call status(), passing 400', (done) => {
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        queries.getQuery(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('upsertQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's not inserted/updated a query
        queries.upsertQuery({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.queries.upsertQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 0 (else) call
        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's successfully inserted/updated a query
        // POST:
        queries.upsertQuery(
            { rowCount: 1, rows: [mockResult], method: 'POST' },
            res,
            next
        );

        it('rowCount > 0 & method === POST should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });

        queries.upsertQuery(
            { rowCount: 1, rows: [mockResult], method: 'PUT' },
            res,
            next
        );
        it('rowCount > 0 & method === PUT should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        it('rowCount > 0 should call json(), passing the result', (done) => {
            expect(res.json).toBeCalledWith(mockResult);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        queries.upsertQuery(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('deleteQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it's not deleted a query
        queries.deleteQuery({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.queries.deleteQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the === 1 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it has deleted a query
        queries.deleteQuery({ rowCount: 1 }, res, next);

        it('rowCount > 0 should call json()', (done) => {
            expect(res.json).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 204', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it has deleted more than one query, this should not happen
        queries.deleteQuery({ rowCount: 2 }, res, next);

        it('rowCount > 1 should call status() passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });

        // Make the failed call
        queries.deleteQuery(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('updateBulk', () => {
        beforeEach(async () => {
            await queries.updateBulk(
                [
                    { rowCount: 1, rows: [mockResult], method: 'PUT' },
                    { rowCount: 1, rows: [mockResult], method: 'PUT' },
                    { rowCount: 1, rows: [mockResult], method: 'PUT' }
                ],
                res,
                next
            );
        });
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's successfully updated 3 queries
        // POST:
        it('the updateBulk DB resolver should be called', async (done) => {
            expect(db.resolvers.queries.updateBulk).toHaveBeenCalled();
            done();
        });
        it('status() should be called, passing 200', (done) => {
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('json() should be called, passing the 3 results', (done) => {
            const mockResults = [
                {
                    id: 1,
                    initiator: 1,
                    labels: [1],
                    latestMessage: { query_id: 1 },
                    participants: [1]
                },
                {
                    id: 1,
                    initiator: 1,
                    labels: [1],
                    latestMessage: { query_id: 1 },
                    participants: [1]
                },
                {
                    id: 1,
                    initiator: 1,
                    labels: [1],
                    latestMessage: { query_id: 1 },
                    participants: [1]
                }
            ];
            expect(res.json).toBeCalledWith(mockResults);
            done();
        });
        it('should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });
    });
});
