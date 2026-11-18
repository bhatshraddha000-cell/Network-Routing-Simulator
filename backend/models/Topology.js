import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['source', 'destination', 'intermediate'],
      required: true,
      default: 'intermediate',
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    weight: { type: Number, required: true, min: 0.01 },
    direction: {
      type: String,
      enum: ['BIDIRECTIONAL', 'ONE_WAY'],
      default: 'BIDIRECTIONAL',
    },
  },
  { _id: false }
);

const topologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Current Working Topology',
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Topology = mongoose.model('Topology', topologySchema);

