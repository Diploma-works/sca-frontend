import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import { api } from '../../utils/api';

const EnhancedBranchGraph = ({ projectId }) => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(50);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'frequency'
  
  const theme = useTheme();

  useEffect(() => {
    const fetchBranchGraph = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.projectAPI.getBranchGraph(projectId, limit);
        const commits = response?.commits || [];
        setGraphData(commits);
      } catch (err) {
        setError('Failed to fetch branch graph: ' + (err.message || 'Unknown error'));
        console.error('Error fetching branch graph:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchGraph();
  }, [projectId, limit]);

  // Extract branch names from commits
  const extractBranchFromRefs = (refs) => {
    if (!refs) return 'main';
    
    // Parse refs like "origin/main, origin/HEAD -> origin/main, tag: v1.0.0"
    const refParts = refs.split(',').map(r => r.trim());
    
    for (const ref of refParts) {
      if (ref.includes('->')) continue; // Skip HEAD references
      if (ref.startsWith('tag:')) continue; // Skip tags
      if (ref.startsWith('origin/')) {
        return ref.replace('origin/', '');
      }
      if (ref && !ref.includes('HEAD')) {
        return ref;
      }
    }
    
    return 'main';
  };

  // Prepare data for timeline view (BarChart showing activity by date)
  const prepareTimelineData = () => {
    if (!graphData || graphData.length === 0) return { dates: [], commitCounts: [] };

    // Group commits by date
    const dateGroups = {};

    graphData.forEach((commit) => {
      const date = new Date(commit.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = 0;
      }
      dateGroups[dateKey]++;
    });

    // Sort dates and prepare data
    const sortedDates = Object.keys(dateGroups).sort();
    const commitCounts = sortedDates.map(date => dateGroups[date]);

    return {
      dates: sortedDates,
      commitCounts
    };
  };

  // Prepare data for frequency view (BarChart)
  const prepareFrequencyData = () => {
    if (!graphData || graphData.length === 0) return { series: [], categories: [] };

    // Count commits per author
    const authorCounts = {};
    const branchCounts = {};

    graphData.forEach((commit) => {
      const author = commit.author || 'Unknown';
      const branch = extractBranchFromRefs(commit.refs);
      
      authorCounts[author] = (authorCounts[author] || 0) + 1;
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });

    const authorData = Object.entries(authorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => ({ author, count }));

    const branchData = Object.entries(branchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([branch, count]) => ({ branch, count }));

    return { authorData, branchData };
  };

  const timelineData = prepareTimelineData();
  const frequencyData = prepareFrequencyData();

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <Typography>Loading enhanced branch graph...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>View Mode</InputLabel>
          <Select
            value={viewMode}
            label="View Mode"
            onChange={(e) => setViewMode(e.target.value)}
          >
            <MenuItem value="timeline">Timeline</MenuItem>
            <MenuItem value="frequency">Frequency</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Limit</InputLabel>
          <Select
            value={limit}
            label="Limit"
            onChange={(e) => setLimit(e.target.value)}
          >
            <MenuItem value={25}>25 commits</MenuItem>
            <MenuItem value={50}>50 commits</MenuItem>
            <MenuItem value={100}>100 commits</MenuItem>
            <MenuItem value={200}>200 commits</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          Showing {graphData.length} commits
        </Typography>
      </Stack>

      {viewMode === 'timeline' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commit Activity Timeline
            </Typography>
            {timelineData.dates && timelineData.dates.length > 0 ? (
              <BarChart
                width={800}
                height={400}
                series={[{
                  data: timelineData.commitCounts,
                  label: 'Commits per day'
                }]}
                xAxis={[{
                  scaleType: 'band',
                  data: timelineData.dates.map(date => new Date(date).toLocaleDateString())
                }]}
                margin={{ left: 60, right: 30, top: 50, bottom: 100 }}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'top', horizontal: 'middle' },
                  },
                }}
              />
            ) : (
              <Typography color="text.secondary">No timeline data available</Typography>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'frequency' && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commits by Author
              </Typography>
              {frequencyData.authorData && frequencyData.authorData.length > 0 ? (
                <BarChart
                  width={600}
                  height={300}
                  series={[{
                    data: frequencyData.authorData.map(item => item.count),
                    label: 'Commits'
                  }]}
                  xAxis={[{
                    scaleType: 'band',
                    data: frequencyData.authorData.map(item => item.author)
                  }]}
                  margin={{ left: 60, right: 30, top: 30, bottom: 80 }}
                />
              ) : (
                <Typography color="text.secondary">No author data available</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Commits by Branch
              </Typography>
              {frequencyData.branchData && frequencyData.branchData.length > 0 ? (
                <BarChart
                  width={600}
                  height={300}
                  series={[{
                    data: frequencyData.branchData.map(item => item.count),
                    label: 'Commits'
                  }]}
                  xAxis={[{
                    scaleType: 'band',
                    data: frequencyData.branchData.map(item => item.branch)
                  }]}
                  margin={{ left: 60, right: 30, top: 30, bottom: 80 }}
                />
              ) : (
                <Typography color="text.secondary">No branch data available</Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Recent commits info */}
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Recent Commits
        </Typography>
        <Stack spacing={1} maxHeight={300} overflow="auto">
          {graphData.slice(0, 10).map((commit, index) => (
            <Card key={commit.hash || index} variant="outlined">
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip 
                    label={commit.shortHash || commit.hash?.substring(0, 7)} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Typography variant="body2" flex={1}>
                    {commit.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {commit.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(commit.date).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default EnhancedBranchGraph;
