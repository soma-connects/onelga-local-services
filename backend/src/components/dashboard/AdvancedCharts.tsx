import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  FileDownload,
  Fullscreen,
} from '@mui/icons-material';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1, boxShadow: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any) => (
          <Typography
            key={entry.name}
            variant="body2"
            sx={{ color: entry.color, mb: 0.5 }}
          >
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

// Advanced Line Chart Component
interface AdvancedLineChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  lines: { key: string; color: string; name: string }[];
  height?: number;
  showTrend?: boolean;
  onExport?: () => void;
  onFullscreen?: () => void;
  isLoading?: boolean;
}

export const AdvancedLineChart: React.FC<AdvancedLineChartProps> = ({
  title,
  subtitle,
  data,
  xKey,
  lines,
  height = 300,
  showTrend = true,
  onExport,
  onFullscreen,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const trendData = useMemo(() => {
    if (!showTrend || data.length < 2) return null;
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const primaryLine = lines[0];
    
    if (!primaryLine || !latest[primaryLine.key] || !previous[primaryLine.key]) return null;
    
    const change = ((latest[primaryLine.key] - previous[primaryLine.key]) / previous[primaryLine.key]) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      label: change > 0 ? 'increase' : 'decrease',
    };
  }, [data, lines, showTrend]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trendData && (
              <Stack direction="row" alignItems="center" spacing={1}>
                {trendData.isPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trendData.isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trendData.value}% {trendData.label}
                </Typography>
              </Stack>
            )}
          </Box>
          <Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {onExport && (
                <MenuItem onClick={() => { onExport(); setAnchorEl(null); }}>
                  <FileDownload sx={{ mr: 1 }} /> Export Data
                </MenuItem>
              )}
              {onFullscreen && (
                <MenuItem onClick={() => { onFullscreen(); setAnchorEl(null); }}>
                  <Fullscreen sx={{ mr: 1 }} /> Fullscreen
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: theme.palette.background.paper }}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Advanced Area Chart Component
interface AdvancedAreaChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  areas: { key: string; color: string; name: string }[];
  height?: number;
  stacked?: boolean;
  isLoading?: boolean;
}

export const AdvancedAreaChart: React.FC<AdvancedAreaChartProps> = ({
  title,
  subtitle,
  data,
  xKey,
  areas,
  height = 300,
  stacked = false,
  isLoading = false,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {areas.map((area, index) => (
                <linearGradient key={area.key} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={area.color} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stackId={stacked ? "1" : area.key}
                stroke={area.color}
                fill={`url(#color${index})`}
                name={area.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Advanced Pie Chart Component
interface AdvancedPieChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  colors?: string[];
  isLoading?: boolean;
}

export const AdvancedPieChart: React.FC<AdvancedPieChartProps> = ({
  title,
  subtitle,
  data,
  nameKey,
  valueKey,
  height = 300,
  showLabels = true,
  showLegend = true,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'],
  isLoading = false,
}) => {

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!showLabels || percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="circular" width={height} height={height} sx={{ mx: 'auto', mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any) => [value, name]}
              labelFormatter={(label) => `${nameKey}: ${label}`}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend with Statistics */}
        <Box sx={{ mt: 2 }}>
          <Stack spacing={1}>
            {data.map((item, index) => {
              const total = data.reduce((sum, d) => sum + d[valueKey], 0);
              const percentage = ((item[valueKey] / total) * 100).toFixed(1);
              return (
                <Box
                  key={item[nameKey]}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: colors[index % colors.length],
                        borderRadius: '2px',
                      }}
                    />
                    <Typography variant="body2">{item[nameKey]}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {item[valueKey]}
                    </Typography>
                    <Chip 
                      label={`${percentage}%`} 
                      size="small" 
                      variant="outlined"
                      sx={{ minWidth: 50 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

// Advanced Bar Chart Component
interface AdvancedBarChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  bars: { key: string; color: string; name: string }[];
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
  isLoading?: boolean;
}

export const AdvancedBarChart: React.FC<AdvancedBarChartProps> = ({
  title,
  subtitle,
  data,
  xKey,
  bars,
  height = 300,
  horizontal = false,
  stacked = false,
  isLoading = false,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            layout={horizontal ? 'horizontal' : 'vertical'}
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            {horizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                <YAxis type="category" dataKey={xKey} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                stackId={stacked ? "a" : undefined}
                fill={bar.color}
                name={bar.name}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Gauge Chart Component
interface GaugeChartProps {
  title: string;
  value: number;
  max: number;
  min?: number;
  color?: string;
  height?: number;
  suffix?: string;
  isLoading?: boolean;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  max,
  min = 0,
  color = '#8884d8',
  height = 200,
  suffix = '',
  isLoading = false,
}) => {
  const theme = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;

  const data = [
    { name: 'Current', value: percentage, fill: color },
    { name: 'Remaining', value: 100 - percentage, fill: theme.palette.grey[200] },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="circular" width={height} height={height} sx={{ mx: 'auto', mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[data[0]]}>
            <RadialBar dataKey="value" cornerRadius={10} fill={color} />
          </RadialBarChart>
        </ResponsiveContainer>
        
        <Box sx={{ mt: -height/2, mb: height/2 - 50 }}>
          <Typography variant="h3" fontWeight="bold" color={color}>
            {value}{suffix}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            of {max}{suffix}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {percentage.toFixed(1)}% complete
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};