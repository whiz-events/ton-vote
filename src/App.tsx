import { isStaging } from 'config';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from 'router/router';


console.log(isStaging);


function App() {
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App


