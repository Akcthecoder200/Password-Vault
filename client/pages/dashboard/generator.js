import { withAuth } from '../../utils/auth';
import PasswordGenerator from '../../components/vault/PasswordGenerator';

function GeneratorPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Password Generator</h1>
        <p className="text-gray-600">
          Create strong and secure passwords for your accounts
        </p>
      </div>
      
      <PasswordGenerator />
    </div>
  );
}

// Wrap with auth HOC to protect this page
export default withAuth(GeneratorPage);