import { Helmet } from 'react-helmet-async';
// sections
import BranchApprovalView from 'src/sections/branches/view/branch-approval-view';

// ----------------------------------------------------------------------

export default function BranchApprovalsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Branch Approvals</title>
      </Helmet>

      <BranchApprovalView />
    </>
  );
}
