import fs from "fs";

import createIntuitProcessor from "@/processor/intuit/intuit.processor";
import createLogger from "@/utils/logger";
import { Config, DataProducer, SalesforceClosedWonResource } from "@/utils/types";

const logger = createLogger("Processor");

// Use a logging library

const STATIC_RESOURCE: SalesforceClosedWonResource[] = [
  {
    opportunity: {
      AccountId: "001Jw00000b2xtCIAQ",
      Deal_Signatory__c: "003Jw00000bN863IAC",
      Amount: 55000,
      RecordTypeId: "0126g000000o02GAAQ",
      Id: "006Jw00000SzxXmIAJ",
      Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108",
    },
    contact: {
      attributes: {
        type: "Contact",
        url: "/services/data/v42.0/sobjects/Contact/003Jw00000bN863IAC",
      },
      Id: "003Jw00000bN863IAC",
      Name: "Umali QBOParentTest",
      Email: "umali@qboparenttest.com",
      Phone: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    products: [
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZsAAI",
        },
        Id: "01t6g000005a2ZsAAI",
        Name: "Self-Paid Media Buy",
        Family: "Paid Search",
        Description:
          "Client paid payment of media buy for paid search on Google Ads, YouTube, Bing and LinkedIn per Work Order Monthly SEM Advertising Budget",
        ProductCode: "MB-PDS-MEDB-SPPT",
        AVSFQB__Quickbooks_Id__c: "97",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZrAAI",
        },
        Id: "01t6g000005a2ZrAAI",
        Name: "Management Fee",
        Family: "Paid Search",
        Description: "30% Service Fee for paid search Campaign Management",
        ProductCode: "SV-PDS-MEDB-MNGF",
        AVSFQB__Quickbooks_Id__c: "96",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2aBAAQ",
        },
        Id: "01t6g000005a2aBAAQ",
        Name: "Standard Display Awareness",
        Family: "Display Advertising",
        Description:
          "Static and animated banners with standard targeting including up to 10% retargeting impressions. Monthly Media Buy Budget (CPM)",
        ProductCode: "MB-DIS-DISP-ATRG",
        AVSFQB__Quickbooks_Id__c: "73",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005bXI1AAM",
        },
        Id: "01t6g000005bXI1AAM",
        Name: "Custom Package",
        Family: "Search Engine Optimization (SEO)",
        Description:
          "A curated SEO package that can include content, consulting, on-page or off-page SEO work specific to the needs of your business.",
        ProductCode: "SV-SEO-PCKG-VARL",
        AVSFQB__Quickbooks_Id__c: "124",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZfAAI",
        },
        Id: "01t6g000005a2ZfAAI",
        Name: "Media Buy Offset",
        Family: "Paid Search",
        Description: "Offset to Self-Paid Media Buy Passthrough (Always negative value)",
        ProductCode: "MB-PDS-MEDB-SPOS",
        AVSFQB__Quickbooks_Id__c: "110",
      },
    ],
    account: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/001Jw00000bE7KVIA0",
      },
      Id: "001Jw00000bE7KVIA0",
      Name: "QBO Grand Parent Test",
      ParentId: null,
      ShippingCity: null,
      ShippingStreet: null,
      ShippingPostalCode: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      BillingCountry: null,
      BillingCity: null,
      BillingStreet: null,
      BillingPostalCode: null,
      BillingLatitude: null,
      BillingLongitude: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    opportunityLineItems: [
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYpIAL",
        },
        Id: "00kJw00000HLgYpIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Self-Paid Media Buy",
        Quantity: 3,
        ServiceDate: "2024-11-13",
        UnitPrice: 3000,
        TotalPrice: 9000,
        Description: "TEST SP MEDIABUY (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYqIAL",
        },
        Id: "00kJw00000HLgYqIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Management Fee",
        Quantity: 2,
        ServiceDate: "2024-11-12",
        UnitPrice: 2000,
        TotalPrice: 4000,
        Description: "TEST MGT FEE (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYrIAL",
        },
        Id: "00kJw00000HLgYrIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Standard Display Awareness",
        Quantity: 1,
        ServiceDate: "2024-11-11",
        UnitPrice: 1000,
        TotalPrice: 1000,
        Description: "TEST SDA (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYsIAL",
        },
        Id: "00kJw00000HLgYsIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Custom Package",
        Quantity: 5,
        ServiceDate: "2024-11-15",
        UnitPrice: 5000,
        TotalPrice: 25000,
        Description: "TEST SEO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYtIAL",
        },
        Id: "00kJw00000HLgYtIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Media Buy Offset",
        Quantity: 4,
        ServiceDate: "2024-11-14",
        UnitPrice: 4000,
        TotalPrice: 16000,
        Description: "TEST MBO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
    ],
    parent: null,
  },
  {
    opportunity: {
      AccountId: "001Jw00000b2xtCIAQ",
      Deal_Signatory__c: "003Jw00000bN863IAC",
      Amount: 55000,
      RecordTypeId: "0126g000000o02GAAQ",
      Id: "006Jw00000SzxXmIAJ",
      Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108",
    },
    contact: {
      attributes: {
        type: "Contact",
        url: "/services/data/v42.0/sobjects/Contact/003Jw00000bN863IAC",
      },
      Id: "003Jw00000bN863IAC",
      Name: "Umali QBOParentTest",
      Email: "umali@qboparenttest.com",
      Phone: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    products: [
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZsAAI",
        },
        Id: "01t6g000005a2ZsAAI",
        Name: "Self-Paid Media Buy",
        Family: "Paid Search",
        Description:
          "Client paid payment of media buy for paid search on Google Ads, YouTube, Bing and LinkedIn per Work Order Monthly SEM Advertising Budget",
        ProductCode: "MB-PDS-MEDB-SPPT",
        AVSFQB__Quickbooks_Id__c: "97",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZrAAI",
        },
        Id: "01t6g000005a2ZrAAI",
        Name: "Management Fee",
        Family: "Paid Search",
        Description: "30% Service Fee for paid search Campaign Management",
        ProductCode: "SV-PDS-MEDB-MNGF",
        AVSFQB__Quickbooks_Id__c: "96",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2aBAAQ",
        },
        Id: "01t6g000005a2aBAAQ",
        Name: "Standard Display Awareness",
        Family: "Display Advertising",
        Description:
          "Static and animated banners with standard targeting including up to 10% retargeting impressions. Monthly Media Buy Budget (CPM)",
        ProductCode: "MB-DIS-DISP-ATRG",
        AVSFQB__Quickbooks_Id__c: "73",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005bXI1AAM",
        },
        Id: "01t6g000005bXI1AAM",
        Name: "Custom Package",
        Family: "Search Engine Optimization (SEO)",
        Description:
          "A curated SEO package that can include content, consulting, on-page or off-page SEO work specific to the needs of your business.",
        ProductCode: "SV-SEO-PCKG-VARL",
        AVSFQB__Quickbooks_Id__c: "124",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZfAAI",
        },
        Id: "01t6g000005a2ZfAAI",
        Name: "Media Buy Offset",
        Family: "Paid Search",
        Description: "Offset to Self-Paid Media Buy Passthrough (Always negative value)",
        ProductCode: "MB-PDS-MEDB-SPOS",
        AVSFQB__Quickbooks_Id__c: "110",
      },
    ],
    account: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/001Jw00000b31bpIAA",
      },
      Id: "001Jw00000b31bpIAA",
      Name: "QBO Parent Test",
      ParentId: "001Jw00000bE7KVIA0",
      ShippingCity: null,
      ShippingStreet: null,
      ShippingPostalCode: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      BillingCountry: null,
      BillingCity: null,
      BillingStreet: null,
      BillingPostalCode: null,
      BillingLatitude: null,
      BillingLongitude: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    opportunityLineItems: [
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYpIAL",
        },
        Id: "00kJw00000HLgYpIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Self-Paid Media Buy",
        Quantity: 3,
        ServiceDate: "2024-11-13",
        UnitPrice: 3000,
        TotalPrice: 9000,
        Description: "TEST SP MEDIABUY (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYqIAL",
        },
        Id: "00kJw00000HLgYqIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Management Fee",
        Quantity: 2,
        ServiceDate: "2024-11-12",
        UnitPrice: 2000,
        TotalPrice: 4000,
        Description: "TEST MGT FEE (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYrIAL",
        },
        Id: "00kJw00000HLgYrIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Standard Display Awareness",
        Quantity: 1,
        ServiceDate: "2024-11-11",
        UnitPrice: 1000,
        TotalPrice: 1000,
        Description: "TEST SDA (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYsIAL",
        },
        Id: "00kJw00000HLgYsIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Custom Package",
        Quantity: 5,
        ServiceDate: "2024-11-15",
        UnitPrice: 5000,
        TotalPrice: 25000,
        Description: "TEST SEO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYtIAL",
        },
        Id: "00kJw00000HLgYtIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Media Buy Offset",
        Quantity: 4,
        ServiceDate: "2024-11-14",
        UnitPrice: 4000,
        TotalPrice: 16000,
        Description: "TEST MBO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
    ],
    parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/001Jw00000bE7KVIA0",
      },
      Id: "001Jw00000bE7KVIA0",
      Name: "QBO Grand Parent Test",
      ParentId: null,
      ShippingCity: null,
      ShippingStreet: null,
      ShippingPostalCode: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      BillingCountry: null,
      BillingCity: null,
      BillingStreet: null,
      BillingPostalCode: null,
      BillingLatitude: null,
      BillingLongitude: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
  },
  {
    opportunity: {
      AccountId: "001Jw00000b2xtCIAQ",
      Deal_Signatory__c: "003Jw00000bN863IAC",
      Amount: 55000,
      RecordTypeId: "0126g000000o02GAAQ",
      Id: "006Jw00000SzxXmIAJ",
      Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108",
    },
    contact: {
      attributes: {
        type: "Contact",
        url: "/services/data/v42.0/sobjects/Contact/003Jw00000bN863IAC",
      },
      Id: "003Jw00000bN863IAC",
      Name: "Umali QBOParentTest",
      Email: "umali@qboparenttest.com",
      Phone: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    products: [
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZsAAI",
        },
        Id: "01t6g000005a2ZsAAI",
        Name: "Self-Paid Media Buy",
        Family: "Paid Search",
        Description:
          "Client paid payment of media buy for paid search on Google Ads, YouTube, Bing and LinkedIn per Work Order Monthly SEM Advertising Budget",
        ProductCode: "MB-PDS-MEDB-SPPT",
        AVSFQB__Quickbooks_Id__c: "97",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZrAAI",
        },
        Id: "01t6g000005a2ZrAAI",
        Name: "Management Fee",
        Family: "Paid Search",
        Description: "30% Service Fee for paid search Campaign Management",
        ProductCode: "SV-PDS-MEDB-MNGF",
        AVSFQB__Quickbooks_Id__c: "96",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2aBAAQ",
        },
        Id: "01t6g000005a2aBAAQ",
        Name: "Standard Display Awareness",
        Family: "Display Advertising",
        Description:
          "Static and animated banners with standard targeting including up to 10% retargeting impressions. Monthly Media Buy Budget (CPM)",
        ProductCode: "MB-DIS-DISP-ATRG",
        AVSFQB__Quickbooks_Id__c: "73",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005bXI1AAM",
        },
        Id: "01t6g000005bXI1AAM",
        Name: "Custom Package",
        Family: "Search Engine Optimization (SEO)",
        Description:
          "A curated SEO package that can include content, consulting, on-page or off-page SEO work specific to the needs of your business.",
        ProductCode: "SV-SEO-PCKG-VARL",
        AVSFQB__Quickbooks_Id__c: "124",
      },
      {
        attributes: {
          type: "Product2",
          url: "/services/data/v42.0/sobjects/Product2/01t6g000005a2ZfAAI",
        },
        Id: "01t6g000005a2ZfAAI",
        Name: "Media Buy Offset",
        Family: "Paid Search",
        Description: "Offset to Self-Paid Media Buy Passthrough (Always negative value)",
        ProductCode: "MB-PDS-MEDB-SPOS",
        AVSFQB__Quickbooks_Id__c: "110",
      },
    ],
    account: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/001Jw00000b2xtCIAQ",
      },
      Id: "001Jw00000b2xtCIAQ",
      Name: "QBO Child Test (QBO PTest)",
      ParentId: "001Jw00000b31bpIAA",
      ShippingCity: null,
      ShippingStreet: null,
      ShippingPostalCode: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      BillingCountry: "United States",
      BillingCity: "Philadelphia",
      BillingStreet: "199 Spring Garden Street",
      BillingPostalCode: "19123",
      BillingLatitude: null,
      BillingLongitude: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
    opportunityLineItems: [
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYpIAL",
        },
        Id: "00kJw00000HLgYpIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Self-Paid Media Buy",
        Quantity: 3,
        ServiceDate: "2024-11-13",
        UnitPrice: 3000,
        TotalPrice: 9000,
        Description: "TEST SP MEDIABUY (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYqIAL",
        },
        Id: "00kJw00000HLgYqIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Management Fee",
        Quantity: 2,
        ServiceDate: "2024-11-12",
        UnitPrice: 2000,
        TotalPrice: 4000,
        Description: "TEST MGT FEE (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYrIAL",
        },
        Id: "00kJw00000HLgYrIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Standard Display Awareness",
        Quantity: 1,
        ServiceDate: "2024-11-11",
        UnitPrice: 1000,
        TotalPrice: 1000,
        Description: "TEST SDA (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYsIAL",
        },
        Id: "00kJw00000HLgYsIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Custom Package",
        Quantity: 5,
        ServiceDate: "2024-11-15",
        UnitPrice: 5000,
        TotalPrice: 25000,
        Description: "TEST SEO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
      {
        attributes: {
          type: "OpportunityLineItem",
          url: "/services/data/v42.0/sobjects/OpportunityLineItem/00kJw00000HLgYtIAL",
        },
        Id: "00kJw00000HLgYtIAL",
        Name: "QBO Parent-QBO Child-DIS-SEM-SEO-241108 Media Buy Offset",
        Quantity: 4,
        ServiceDate: "2024-11-14",
        UnitPrice: 4000,
        TotalPrice: 16000,
        Description: "TEST MBO (CHILD)",
        AVSFQB__Quickbooks_Id__c: null,
      },
    ],
    parent: {
      attributes: {
        type: "Account",
        url: "/services/data/v42.0/sobjects/Account/001Jw00000b31bpIAA",
      },
      Id: "001Jw00000b31bpIAA",
      Name: "QBO Parent Test",
      ParentId: "001Jw00000bE7KVIA0",
      ShippingCity: null,
      ShippingStreet: null,
      ShippingPostalCode: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      BillingCountry: null,
      BillingCity: null,
      BillingStreet: null,
      BillingPostalCode: null,
      BillingLatitude: null,
      BillingLongitude: null,
      AVSFQB__Quickbooks_Id__c: null,
    },
  },
];
const createProcessor = async (producer: DataProducer, config: Config) => {
  const intuit = await createIntuitProcessor();

  const process = async (type: string, resources: SalesforceClosedWonResource[]) => {
    logger.info(`Recieved Closed Won resources: ${JSON.stringify(resources, null, 2)}`);

    await intuit.process(type, STATIC_RESOURCE);
  };

  return {
    async listen() {
      producer.closedWon.all((candidates) => process("All", candidates));
    },
  };
};

export default createProcessor;
