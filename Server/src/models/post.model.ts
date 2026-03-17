import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  text: string;
  image?: string;
  owner: Types.ObjectId;
  tags: string[];
  likesCount: number;
  commentsCount: number;
}

const postSchema = new Schema<IPost>(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

postSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'postId',
  count: true
});

postSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
  count: true
});

postSchema.index({ text: 'text', tags: 'text' }, { default_language: 'english' });

export default mongoose.model<IPost>('Post', postSchema);
