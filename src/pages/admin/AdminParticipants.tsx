import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, CheckCircle, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminParticipants = () => {
  const navigate = useNavigate();
  const { currentUser, participants } = useAppStore();
  const [search, setSearch] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState(participants);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const filtered = participants.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.teamName.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search)
    );
    setFilteredParticipants(filtered);
  }, [search, participants]);

  const handleExport = () => {
    const data = participants.map(p => ({
      Name: p.name,
      Mobile: p.mobile,
      Email: p.email || '',
      'Team Name': p.teamName,
      Breakfast: p.breakfast ? 'Yes' : 'No',
      Lunch: p.lunch ? 'Yes' : 'No',
      Dinner: p.dinner ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    XLSX.writeFile(workbook, `participants-${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate('/admin/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Participants Management</CardTitle>
                <CardDescription>View and manage all registered participants</CardDescription>
              </div>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, team, or mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Breakfast</TableHead>
                    <TableHead className="text-center">Lunch</TableHead>
                    <TableHead className="text-center">Dinner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell>{participant.mobile}</TableCell>
                        <TableCell>{participant.teamName}</TableCell>
                        <TableCell className="text-center">
                          {participant.breakfast ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {participant.lunch ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {participant.dinner ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredParticipants.length} of {participants.length} participants
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminParticipants;
