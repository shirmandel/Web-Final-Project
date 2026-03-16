import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
  text: string;
  image?: string;
  owner: Types.ObjectId;
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

export default mongoose.model<IPost>('Post', postSchema);
