Promise = require("bluebird");

var StandardApprovers = {

  // Management by function and by DOA
  directManager: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'directManager',
        fullname: 'Direct Manager',
        step: 'Direct Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  departmentHead: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'departmentHead',
        fullname: 'Department Head',
        step: 'Department Head',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  doaManager: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'doaManager',
        fullname: 'DOA Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  doaManagerExcludeDirectManager: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'doaManager',
        fullname: 'DOA Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  doaManagers: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'directManager',
        fullname: 'Direct Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      },
      {
        type: 'm',
        username: 'doaManager',
        fullname: 'DOA Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      },
      {
        type: 'm',
        username: 'doaSeniorManager',
        fullname: 'DOA Senior Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  doaManagersExcludeDirectManager: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'doaManager',
        fullname: 'DOA Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      },
      {
        type: 'm',
        username: 'doaSeniorManager',
        fullname: 'DOA Senior Manager',
        step: 'DOA Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  // Business Partner by function and by DOV
  financeBusinessPartner: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'financeBusinessPartner',
        fullname: 'Finance BP',
        step: 'Finance BP',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  dovFinanceBusinessPartner: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'dovFinanceBusinessPartner',
        fullname: 'Finance BP',
        step: 'DOV Finance BP',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  dovFinanceBusinessPartners: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'dovFinanceBusinessPartner',
        fullname: 'Finance BP',
        step: 'DOV Finance BP',
        comment: '',
        decision: '',
        decided_at: ''
      },
      {
        type: 'm',
        username: 'dovSeniorFinanceBusinessPartner',
        fullname: 'Senior Finance BP',
        step: 'DOV Finance BP',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  hrBusinessPartner: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'dovHrBusinessPartner',
        fullname: 'Human Resource BP',
        step: 'Human Resource BP',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  // Fixed positon
  chiefAccountant: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefAccountant',
        fullname: 'Chief Accountant',
        step: 'Chief Accountant',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  chiefFinanceOfficer: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefFinanceOfficer',
        fullname: 'Chief Financial Officer',
        step: 'Chief Financial Officer',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  chiefComplianceOfficer: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefComplianceOfficer',
        fullname: 'Chief Compliance Officer',
        step: 'Chief Compliance Officer',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  chiefHumanCapitalOfficer: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefHumanCapitalOfficer',
        fullname: 'Chief Human Capital Officer',
        step: 'Chief Human Capital Officer',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  chiefMarketingOfficer: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefMarketingOfficer',
        fullname: 'Chief Marketing Officer',
        step: 'Chief Marketing Officer',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  chiefExecutiveOfficer: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'chiefExecutiveOfficer',
        fullname: 'Chief Executive Officer',
        step: 'Chief Executive Officer',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  generalManager: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'generalManager',
        fullname: 'General Manager',
        step: 'General Manager',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  generalDirector: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'generalDirector',
        fullname: 'General Director',
        step: 'General Director',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  // Functionality
  systemMasterData: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'systemMasterData',
        fullname: 'System Master Data',
        step: 'System Master Data',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  legalEntityMasterData: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'legalEntityMasterData',
        fullname: 'Legal Entity Master Data',
        step: 'Legal Entity Master Data',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  vendorMasterData: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'vendorMasterData',
        fullname: 'Vendor Master Data',
        step: 'Vendor Master Data',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  },

  customerMasterData: async => {
    return Promise.resolve([
      {
        type: 'm',
        username: 'vendorMasterData',
        fullname: 'Vendor Master Data',
        step: 'Vendor Master Data',
        comment: '',
        decision: '',
        decided_at: ''
      }
    ]);
  }
}
module.exports = StandardApprovers;
