/**
 * Column ids of the "my reports" table.
 *
 * AS3 declares these four as public statics **on `MyReportStatus` itself**, and
 * `ReportStatusTableObject` reads them from there. Transcribed that way they form a real import
 * cycle in TypeScript — `MyReportStatus` constructs `ReportStatusTableObject` rows, so it needs the
 * class as a value, and the row would need `MyReportStatus` as a value for the constants. Pulling
 * the four out into their own module is the same shape `CatalogWidgetName` already uses here.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as
 */
export const MyReportStatusColumn = {
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::COLUMN_REPORT_DATE
    REPORT_DATE: 'report_date',

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::COLUMN_REPORTED_ACCOUNT
    REPORTED_ACCOUNT: 'account',

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::COLUMN_REASON
    REASON: 'reason',

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/MyReportStatus.as::COLUMN_APPEAL_STATUS
    APPEAL_STATUS: 'appeal_status'
} as const;
