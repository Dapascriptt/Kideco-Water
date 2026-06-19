import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, LabelList,
} from 'recharts';

const axis = { fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#5A6571' };

function barColor(v) {
  if (v >= 95) return '#1A7F37';
  if (v >= 80) return '#BF8700';
  return '#D1242F';
}

export default function ComplianceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 32, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="#E4E9EE" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={axis} stroke="#AEB7C0" unit="%" />
        <YAxis type="category" dataKey="pond" tick={{ ...axis, fontFamily: 'var(--font-body)' }} stroke="#AEB7C0" width={70} />
        <ReferenceLine x={95} stroke="#1F6FEB" strokeDasharray="5 4"
          label={{ value: 'Target 95%', position: 'top', fontSize: 10, fill: '#1F6FEB' }} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #D6DCE2', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          formatter={(v) => [`${v}%`, 'Kepatuhan']} />
        <Bar dataKey="compliance" barSize={20} isAnimationActive={false}>
          {data.map((d) => <Cell key={d.pond} fill={barColor(d.compliance)} />)}
          <LabelList dataKey="compliance" position="right" formatter={(v) => `${v}%`}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#5A6571' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
