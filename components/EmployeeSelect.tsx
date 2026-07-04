import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { API } from '../../config';

interface Employee {
  nrp: string;
  nama: string;
  jobsite?: string;
  atasan1?: string;
  atasan2?: string;
}

interface EmployeeSelectProps {
  value: string;
  onChange: (nrp: string) => void;
  placeholder?: string;
  actorType?: string;
  required?: boolean;
}

export function EmployeeSelect({
  value,
  onChange,
  placeholder = 'Pilih NRP',
  actorType = 'Creator',
  required = false,
}: EmployeeSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API.EMPLOYEE_GET_LIST(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 1,
            actorType: actorType,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        // Adjust based on your actual API response structure
        setEmployees(data.data || data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employees');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [actorType]);

  return (
    <div className="space-y-2">
      <Label htmlFor="nrp" className="text-xs sm:text-sm">
        NRP <span className="text-red-500">{required ? '*' : ''}</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="nrp" className="text-sm">
          <SelectValue placeholder={loading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {employees.map((emp) => (
            <SelectItem key={emp.nrp} value={emp.nrp}>
              {emp.nrp} - {emp.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
