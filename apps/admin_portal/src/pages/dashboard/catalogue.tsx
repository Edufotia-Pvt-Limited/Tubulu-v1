import { Helmet } from 'react-helmet-async';
// sections
import CatalogueListView from 'src/sections/catalogue/view/catalogue-list-view';

// ----------------------------------------------------------------------

export default function CataloguePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Catalogue Management</title>
      </Helmet>

      <CatalogueListView />
    </>
  );
}
