import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Legend,
} from 'recharts';

const axis = { fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#5A6571' };

export default function LevelInflowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#E4E9EE" vertical={false} />
        <XAxis dataKey="time" tick={axis} stroke="#AEB7C0" />
        <YAxis yAxisId="left" domain={[0, 100]} tick={axis} stroke="#AEB7C0"
          label={{ value: 'Level (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#98A2AE' }} />
        <YAxis yAxisId="right" orientation="right" tick={axis} stroke="#AEB7C0"
          label={{ value: 'Inflow (m³/jam)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#98A2AE' }} />

        {/* Danger zone above 85% */}
        <ReferenceArea yAxisId="left" y1={85} y2={100} fill="#D1242F" fillOpacity={0.08} />
        <ReferenceLine yAxisId="left" y={85} stroke="#BF8700" strokeDasharray="5 4"
          label={{ value: 'Warning 85%', position: 'insideTopLeft', fontSize: 10, fill: '#BF8700' }} />
        <ReferenceLine yAxisId="left" y={95} stroke="#D1242F" strokeDasharray="5 4"
          label={{ value: 'Kritis 95%', position: 'insideTopLeft', fontSize: 10, fill: '#D1242F' }} />

        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #D6DCE2', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="left" dataKey="level" name="Level (%)" fill="#58A6FF" barSize={16} isAnimationActive={false} />
        <Line yAxisId="right" type="monotone" dataKey="inflow" name="Inflow (m³/jam)"
          stroke="#1F6FEB" strokeWidth={2} dot={false} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
