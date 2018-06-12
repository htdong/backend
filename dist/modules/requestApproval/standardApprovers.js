var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Promise = require("bluebird");
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;
var Model = mongoose.Model;
var UsersController = require('../users/users.controller');
var DeptsController = require('../depts/depts.controller');
var StandardApprovers = {
    /**
    * @function getFireFighter
    * Return a contact who involve in approval flow to fix the issues detected
    *
    * @param {string} comment
    *
    * @return {approver}
    */
    getFireFighter: (comment) => {
        console.log('getFireFighter');
        return {
            type: 'm',
            username: 'htdong',
            fullname: 'Hoang Thanh Dong',
            step: 'Fire fighter',
            comment: comment,
            decision: '',
            decided_at: ''
        };
    },
    /**
    * @function searchForPosition
    * Search in employees population for those assume a particular position
    *
    * @param req
    * @param res
    * @param positon Position to be searched
    *
    * @return {[approvers]}
    */
    searchForPosition: (req, res, position, positionTitle = '') => __awaiter(this, void 0, void 0, function* () {
        console.log('searchForPosition');
        try {
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let query = {
                $and: [
                    { status1: 'Active' },
                    { status2: 'Unmarked' },
                    { position: position }
                ]
            };
            let users = yield User.find(query).select('username fullname').sort({ fullname: 1, username: 1 });
            let result = [];
            if (users.length) {
                const usersLen = users.length;
                for (let i = 0; i < usersLen; i++) {
                    result.push({
                        type: 'm',
                        username: users[i].username,
                        fullname: users[i].fullname,
                        step: positionTitle ? positionTitle : position,
                        comment: '',
                        decision: '',
                        decided_at: ''
                    });
                }
            }
            else {
                const firefighter = StandardApprovers.getFireFighter(position + ' not existed!');
                result = [firefighter];
            }
            return Promise.resolve(result);
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in search for a position!');
            return Promise.resolve([firefighter]);
        }
    }),
    /**
    * @function searchBusinessPartner
    * Search in department collection for business parner position
    *
    * @param req
    * @param res
    * @param positon Position to be searched
    *
    * @return {[approvers]}
    */
    searchBusinessPartner: (req, res, deptId, position, positionTitle = '') => __awaiter(this, void 0, void 0, function* () {
        console.log('searchBusinessPartner');
        try {
            let Dept = yield DeptsController.getModel(req, res);
            let query = {
                $and: [
                    { _id: ObjectId(deptId) },
                    { status1: 'Active' },
                    { status2: 'Unmarked' },
                ]
            };
            let depts = yield Dept.find(query).select(position);
            if (depts) {
                const dept = Object.assign({}, depts[0]._doc);
                console.log(dept);
                return Promise.resolve([
                    {
                        type: 'm',
                        username: dept[position].username,
                        fullname: dept[position].fullname,
                        step: positionTitle ? positionTitle : position,
                        comment: dept.desc,
                        decision: '',
                        decided_at: ''
                    }
                ]);
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('Finance BP is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in search for a position!');
            return Promise.resolve([firefighter]);
        }
    }),
    /**
    * @function buildHierarchyByPosition
    *
    * @param req
    * @param res
    * @param usernameStart - Start building hierarchy from this username
    * @param position - Stope building hierarchy when current username assume position
    *
    * @exception will insert Fight fighter to fix the organization
    * - Broken organization chart: No user is found or no username
    * - Missing position in hierarchy definition, leading to top of organization
    *   + direct Manager is also the user
    *   + position of user is "chiefexecutive"
    * - Missing position in hierarchy definition, leading to 10 upper levels
    *
    * @return {[approvers]}
    */
    buildHierarchyByPosition: (req, res, usernameStart, position, topPosition) => __awaiter(this, void 0, void 0, function* () {
        console.log('buildHierarchyByPosition');
        try {
            let hierarchy = [];
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let username = usernameStart;
            const maxApprovers = 10;
            let i = 1;
            let onBreak = false;
            do {
                console.log('Step: ', i);
                if (username && (i <= maxApprovers)) {
                    let query = {
                        $and: [
                            { username: username },
                            { status1: 'Active' },
                            { status2: 'Unmarked' }
                        ]
                    };
                    let user = yield User.find(query).select('username fullname position directmanager');
                    if (!user) {
                        const firefighter = StandardApprovers.getFireFighter('Org chart is broken!');
                        hierarchy.push(firefighter);
                        onBreak = true;
                        return Promise.resolve(hierarchy);
                    }
                    else {
                        username = user[0].directmanager.username;
                        hierarchy.push({
                            type: 'm',
                            username: user[0].username,
                            fullname: user[0].fullname,
                            position: user[0].position,
                            step: 'Upper +' + i,
                            comment: '',
                            decision: '',
                            decided_at: ''
                        });
                        i++;
                        // FIX
                        if ((user[0].username === user[0].directmanager.username) || (user[0].position === topPosition)) {
                            // const firefighter = StandardApprovers.getFireFighter('Reach to top of organization! ' + topPosition);
                            // hierarchy.push(firefighter);
                            onBreak = true;
                            return Promise.resolve(hierarchy);
                        }
                        // GOOD FLOW
                        if (user[0].position === position) {
                            onBreak = true;
                            return Promise.resolve(hierarchy);
                        }
                    }
                }
                else {
                    // FIX
                    const firefighter = StandardApprovers.getFireFighter('No user or more than 10 approver! Max approvers: ' + maxApprovers);
                    hierarchy.push(firefighter);
                    onBreak = true;
                    return Promise.resolve(hierarchy);
                }
                console.log('Approvers: ', hierarchy);
            } while (!onBreak);
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build hierarchy by position!');
            return Promise.resolve([firefighter]);
        }
    }),
    /**
    * @function buildHierarchyByAmount
    *
    * @param req
    * @param res
    * @param usernameStart - Start building hierarchy from this username
    * @param requestAmount - Total value of concerning request
    * @param maxAmount - Max Amount at which DOA or DOV could not exceed
    * @param checktype - DOA or DOV
    *
    * TODO
    *@exception will insert Fight fighter to fix the organization
    * - Broken organization chart: No user is found or no username
    * - Missing position in hierarchy definition, leading to top of organization
    *   + direct Manager is also the user
    *   + position of user is "chiefexecutive"
    * - Missing position in hierarchy definition, leading to 10 upper levels
    *
    * @return {[approvers]}
    */
    buildHierarchyByAmount: (req, res, usernameStart, requestAmount, maxAmount, checktype) => __awaiter(this, void 0, void 0, function* () {
        console.log('buildHierarchyByAmount');
        try {
            let hierarchy = [];
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let username = usernameStart;
            const maxApprovers = 10;
            let i = 1;
            let onBreak = false;
            do {
                // console.log('Step: ', i);
                if (username && (i <= maxApprovers)) {
                    let query = {
                        $and: [
                            { username: username },
                            { status1: 'Active' },
                            { status2: 'Unmarked' }
                        ]
                    };
                    let user = yield User.find(query).select('username fullname doa dov directmanager');
                    if (!user) {
                        const firefighter = StandardApprovers.getFireFighter('Org chart is broken!');
                        hierarchy.push(firefighter);
                        onBreak = true;
                        return Promise.resolve(hierarchy);
                    }
                    else {
                        username = user[0].directmanager.username;
                        hierarchy.push({
                            type: 'm',
                            username: user[0].username,
                            fullname: user[0].fullname,
                            doa: user[0].doa,
                            dov: user[0].dov,
                            step: 'Upper +' + i,
                            comment: checktype + ': ' + (checktype === 'DOA' ? user[0].doa : user[0].dov),
                            decision: '',
                            decided_at: ''
                        });
                        i++;
                        // FIX
                        if ((user[0].username === user[0].directmanager.username) || ((checktype === 'DOA') && (user[0].doa > maxAmount))) {
                            // const firefighter = StandardApprovers.getFireFighter('Reach to top of organization! ' + maxAmount);
                            // hierarchy.push(firefighter);
                            onBreak = true;
                            return Promise.resolve(hierarchy);
                        }
                        if ((checktype === 'DOV') && (user[0].dov >= maxAmount)) {
                            // const firefighter = StandardApprovers.getFireFighter('Reach to top of organization! ' + maxAmount);
                            // hierarchy.push(firefighter);
                            onBreak = true;
                            return Promise.resolve(hierarchy);
                        }
                        // GOOD FLOW
                        if (((checktype === 'DOA') && (user[0].doa >= requestAmount)) || (((checktype === 'DOV') && (user[0].dov >= requestAmount)))) {
                            onBreak = true;
                            return Promise.resolve(hierarchy);
                        }
                    }
                }
                else {
                    // FIX
                    const firefighter = StandardApprovers.getFireFighter('No user or more than 10 approver! Max approvers: ' + maxApprovers);
                    hierarchy.push(firefighter);
                    onBreak = true;
                    return Promise.resolve(hierarchy);
                }
                // console.log('Approvers: ', hierarchy);
            } while (!onBreak);
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build hierarchy by Amount! Type: ' + checktype);
            return Promise.resolve([firefighter]);
        }
    }),
    // Management by function and by DOA
    fxDirectManager: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('directManager');
        try {
            // console.log('Hello there', params);
            if (params.directmanager) {
                return Promise.resolve([
                    {
                        type: 'm',
                        username: params.directmanager.username,
                        fullname: params.directmanager.fullname,
                        step: 'Direct Manager',
                        comment: '',
                        decision: '',
                        decided_at: ''
                    }
                ]);
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('Direct Manager is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build Direct Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDepartmentHead: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('departmentHead');
        try {
            // console.log('Hello there', params);
            let hierarchy = yield StandardApprovers.buildHierarchyByPosition(req, res, params.directmanager.username, 'departmenthead', 'chiefexecutive');
            // console.log(hierarchy);
            // Last item in hierarchy is either correct Department Head or Fire Fighter
            if (hierarchy) {
                const hierarchyLen = hierarchy.length - 1;
                console.log(hierarchy[hierarchyLen]);
                return Promise.resolve([hierarchy[hierarchyLen]]);
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('Dept Head is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build Dept Head approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDOAManager: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('doaManager');
        try {
            // console.log('Hello there', params);
            // SUCCESS
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 9000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 50000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 250000000, 5000000000, 'DOA');
            let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 750000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 2000000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 6000000000, 5000000000, 'DOA');
            console.log(hierarchy);
            // Last item in hierarchy is either correct Department Head or Fire Fighter
            if (hierarchy) {
                const hierarchyLen = hierarchy.length - 1;
                console.log(hierarchy[hierarchyLen]);
                return Promise.resolve([hierarchy[hierarchyLen]]);
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('DOA Manager is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDOAManagerExcludeDirectManager: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('doaManagerExcludeDirectManager');
        try {
            // console.log('Hello there', params);
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let query = {
                $and: [
                    { username: params.directmanager.username },
                    { status1: 'Active' },
                    { status2: 'Unmarked' }
                ]
            };
            let user = yield User.find(query).select('username directmanager');
            if (user) {
                // SUCCESS
                let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 9000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 50000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 250000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 750000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 2000000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 6000000000, 5000000000, 'DOA');
                console.log(hierarchy);
                // Last item in hierarchy is either correct Department Head or Fire Fighter
                if (hierarchy) {
                    const hierarchyLen = hierarchy.length - 1;
                    console.log(hierarchy[hierarchyLen]);
                    return Promise.resolve([hierarchy[hierarchyLen]]);
                }
                else {
                    const firefighter = StandardApprovers.getFireFighter('DOA Manager Excluded Direct Manager is yet defined! ');
                    return Promise.resolve([firefighter]);
                }
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('DOA Manager Excluded Direct Manager is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDOAManagers: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('doaManagers');
        try {
            // console.log('Hello there', params);
            // SUCCESS
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 9000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 50000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 250000000, 5000000000, 'DOA');
            let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 750000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 2000000000, 5000000000, 'DOA');
            // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, params.directmanager.username, 6000000000, 5000000000, 'DOA');
            console.log(hierarchy);
            // Last item in hierarchy is either correct Department Head or Fire Fighter
            if (hierarchy) {
                return Promise.resolve(hierarchy);
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('DOA Managers is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Managers approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDOAManagersExcludeDirectManager: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('doaManagersExcludeDirectManager');
        try {
            // console.log('Hello there', params);
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let query = {
                $and: [
                    { username: params.directmanager.username },
                    { status1: 'Active' },
                    { status2: 'Unmarked' }
                ]
            };
            let user = yield User.find(query).select('username directmanager');
            if (user) {
                // SUCCESS
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 9000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 50000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 250000000, 5000000000, 'DOA');
                let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 750000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 2000000000, 5000000000, 'DOA');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, user[0].directmanager.username, 6000000000, 5000000000, 'DOA');
                console.log(hierarchy);
                // Last item in hierarchy is either correct Department Head or Fire Fighter
                if (hierarchy) {
                    return Promise.resolve(hierarchy);
                }
                else {
                    const firefighter = StandardApprovers.getFireFighter('DOA Managers Excluded Direct Manager is yet defined! ');
                    return Promise.resolve([firefighter]);
                }
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('DOA Managers Excluded Direct Manager is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Managers Excluded Direct Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    // Business Partner by function and by DOV
    fxFinanceBusinessPartner: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('financeBusinessPartner');
        return StandardApprovers.searchBusinessPartner(req, res, params.department._id, 'financebp', 'Finance Business Partner');
    }),
    fxDOVFinanceBusinessPartner: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('dovFinanceBusinessPartner');
        try {
            let Dept = yield DeptsController.getModel(req, res);
            let query = {
                $and: [
                    { _id: ObjectId(params.department._id) },
                    { status1: 'Active' },
                    { status2: 'Unmarked' },
                ]
            };
            let depts = yield Dept.find(query).select('financebp');
            if (depts) {
                const dept = Object.assign({}, depts[0]._doc);
                console.log(dept);
                // console.log('Hello there', params);
                // SUCCESS
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 250000000, 5000000000, 'DOV');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 750000000, 5000000000, 'DOV');
                let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 1500000000, 5000000000, 'DOV');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 7000000000, 5000000000, 'DOV');
                console.log(hierarchy);
                // Last item in hierarchy is either correct Department Head or Fire Fighter
                if (hierarchy) {
                    const hierarchyLen = hierarchy.length - 1;
                    console.log(hierarchy[hierarchyLen]);
                    return Promise.resolve([hierarchy[hierarchyLen]]);
                }
                else {
                    const firefighter = StandardApprovers.getFireFighter('DOA Manager is yet defined! ');
                    return Promise.resolve([firefighter]);
                }
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('Finance BP is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxDOVFinanceBusinessPartners: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('dovFinanceBusinessPartners');
        try {
            let Dept = yield DeptsController.getModel(req, res);
            let query = {
                $and: [
                    { _id: ObjectId(params.department._id) },
                    { status1: 'Active' },
                    { status2: 'Unmarked' },
                ]
            };
            let depts = yield Dept.find(query).select('financebp');
            if (depts) {
                const dept = Object.assign({}, depts[0]._doc);
                console.log(dept);
                // console.log('Hello there', params);
                // SUCCESS
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 250000000, 5000000000, 'DOV');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 750000000, 5000000000, 'DOV');
                // let hierarchy = await StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 1500000000, 5000000000, 'DOV');
                let hierarchy = yield StandardApprovers.buildHierarchyByAmount(req, res, dept.financebp.username, 7000000000, 5000000000, 'DOV');
                console.log(hierarchy);
                // Last item in hierarchy is either correct Department Head or Fire Fighter
                if (hierarchy) {
                    return Promise.resolve(hierarchy);
                }
                else {
                    const firefighter = StandardApprovers.getFireFighter('DOA Manager is yet defined! ');
                    return Promise.resolve([firefighter]);
                }
            }
            else {
                const firefighter = StandardApprovers.getFireFighter('Finance BP is yet defined! ');
                return Promise.resolve([firefighter]);
            }
        }
        catch (err) {
            console.log(err);
            const firefighter = StandardApprovers.getFireFighter('Error in build DOA Manager approval!');
            return Promise.resolve([firefighter]);
        }
    }),
    fxHRBusinessPartner: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('hrBusinessPartner');
        return StandardApprovers.searchBusinessPartner(req, res, params.department._id, 'hrbp', 'HR Business Partner');
    }),
    // Fixed positon
    fxChiefAccountant: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefAccountant');
        const positionTitle = 'chiefaccountant';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Accountant');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxChiefFinanceOfficer: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefFinanceOfficer');
        const positionTitle = 'cfo';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Finance Officer');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxChiefComplianceOfficer: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefComplianceOfficer');
        const positionTitle = 'cco';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Compliance Officer');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxChiefHumanCapitalOfficer: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefHumanCapitalOfficer');
        const positionTitle = 'chiefhr';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Human Capital Officer');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxChiefMarketingOfficer: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefMarketingOfficer');
        const positionTitle = 'chiefmarketing';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Marketing Officer');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxChiefExecutiveOfficer: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('chiefExecutiveOfficer');
        const positionTitle = 'chiefexecutive';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Chief Executive Officer');
        console.log(position);
        return Promise.resolve(position);
    }),
    // Functionality
    fxSystemMasterData: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        const positionTitle = 'systemmd';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'System Master Data');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxLegalEntityMasterData: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('fxLegalEntityMasterData');
        const positionTitle = 'legalentitymd';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Legal Entity Master Data');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxVendorMasterData: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('fxVendorMasterData');
        const positionTitle = 'vendormd';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Vendor Master Data');
        console.log(position);
        return Promise.resolve(position);
    }),
    fxCustomerMasterData: (req, res, params) => __awaiter(this, void 0, void 0, function* () {
        console.log('fxCustomerMasterData');
        const positionTitle = 'customermd';
        let position = yield StandardApprovers.searchForPosition(req, res, positionTitle, 'Customer Master Data');
        console.log(position);
        return Promise.resolve(position);
    })
};
module.exports = StandardApprovers;
