// The thing we're testing
const messages = require('../../controllers/messages');

// The DB module that messages.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        messages: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allMessages: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            upsertMessage: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            deleteMessage: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            })
        }
    }
}));

describe('Messages', () => {
    describe('getMessages', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the call
        messages.getMessages({}, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.allMessages).toHaveBeenCalled();
            done();
        });
        it('should call res.json', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });
    });
    describe('upsertMessage', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertMessage DB resolver above to
        // pretend it's not inserted/updated a message
        messages.upsertMessage({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.upsertMessage).toHaveBeenCalled();
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
        // Here we're telling our mocked upsertMessage DB resolver above to
        // pretend it's successfully inserted/updated a message
        // POST:
        messages.upsertMessage({ rowCount: 1, method: 'POST' }, res, next);

        it('rowCount > 0 & method === POST should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        messages.upsertMessage(
            { rowCount: 1, method: 'PUT', rows: [mockResult] },
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
    });

    describe('deleteMessage', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it's not deleted a message
        messages.deleteMessage({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.deleteMessage).toHaveBeenCalled();
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
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it has deleted a message
        messages.deleteMessage({ rowCount: 1 }, res, next);

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
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it has deleted more than one message, this should not happen
        messages.deleteMessage({ rowCount: 2 }, res, next);

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
    });
});