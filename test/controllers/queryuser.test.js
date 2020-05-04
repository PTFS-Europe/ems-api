// The thing we're testing
const queryuser = require('../../controllers/queryuser');

// The DB module that queryuser.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        queryuser: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            addUserToQuery: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            updateMostRecentSeen: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            })
        }
    }
}));

describe('QueryUsers', () => {
    describe('addUserToQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked addUserToQuery DB resolver above to
        // pretend it's not inserted a user query relationship
        queryuser.addUserToQuery({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.queryuser.addUserToQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
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

        // Make the == 1 call
        // Here we're telling our mocked addUserToQuery DB resolver above to
        // pretend it's successfully inserted user query relationship
        // POST:
        queryuser.addUserToQuery(
            { rowCount: 1, rows: [mockResult] },
            res,
            next
        );

        it('rowCount == 1 should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        it('rowCount == 1 should call json()', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('rowCount == 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked addUserToQuery DB resolver above to
        // pretend it's updated > 1 rows which shouldn't ever happen
        // POST:
        queryuser.addUserToQuery({ rowCount: 2 }, res, next);

        it('rowCount > 1 should call status(), passing 500', (done) => {
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
    });

    describe('updateMostRecentSeen', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked updateMostRecentSeen DB resolver above to
        // pretend it's not inserted a user query relationship
        queryuser.updateMostRecentSeen({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(
                db.resolvers.queryuser.updateMostRecentSeen
            ).toHaveBeenCalled();
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

        // Make the == 1 call
        // Here we're telling our mocked updateMostRecentSeen DB resolver above to
        // pretend it's successfully updated 1 user query relationship
        // PUT:
        queryuser.updateMostRecentSeen(
            { rowCount: 1, rows: [mockResult] },
            res,
            next
        );

        it('rowCount == 1 should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('rowCount == 1 should call json()', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('rowCount == 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked updateMostRecentSeen DB resolver above to
        // pretend it's deleted > 1 rows which shouldn't ever happen
        // POST:
        queryuser.updateMostRecentSeen({ rowCount: 2 }, res, next);

        it('rowCount > 1 should call status(), passing 500', (done) => {
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
    });
});