-- PetPair 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 用户表 ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(50) NOT NULL DEFAULT '宠物爱好者',
  avatar TEXT,
  city VARCHAR(50) DEFAULT '上海市',
  lat DECIMAL(10,8) DEFAULT 31.2304,
  lng DECIMAL(11,8) DEFAULT 121.4737,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 宠物表 ====================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  breed VARCHAR(50) NOT NULL,
  species VARCHAR(10) DEFAULT 'dog' CHECK (species IN ('dog', 'cat', 'other')),
  age INT DEFAULT 1,
  gender VARCHAR(10) DEFAULT 'male',
  weight DECIMAL(5,2),
  size VARCHAR(10) DEFAULT 'medium',
  neutered BOOLEAN DEFAULT FALSE,
  personality_tags TEXT[] DEFAULT '{}',
  energy_level VARCHAR(10) DEFAULT 'medium',
  activity_preferences TEXT[] DEFAULT '{}',
  social_preferences TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  vaccine_status VARCHAR(20) DEFAULT 'partial',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 邀约表 ====================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  to_pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  meet_time TIMESTAMPTZ,
  location VARCHAR(200),
  activity_type VARCHAR(50) DEFAULT '散步',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 消息表 ====================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'location', 'invitation')),
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 动态表 ====================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 评论表 ====================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 点赞表 ====================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ==================== 评价表 ====================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  friendliness INT DEFAULT 5 CHECK (friendliness BETWEEN 1 AND 5),
  punctuality INT DEFAULT 5 CHECK (punctuality BETWEEN 1 AND 5),
  accuracy INT DEFAULT 5 CHECK (accuracy BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 通知表 ====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 黑名单表 ====================
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- ==================== 索引 ====================
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_invitations_from_user ON invitations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user ON invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

-- ==================== RLS 策略 ====================
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- 用户表：所有人可读，只能修改自己
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- 宠物表：所有人可读，只能管理自己的
CREATE POLICY IF NOT EXISTS "Pets are viewable by everyone" ON pets FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Owners can insert pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "Owners can update pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "Owners can delete pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- 邀约表：相关用户可读，只能创建涉及自己的
CREATE POLICY IF NOT EXISTS "Invitation participants can view" ON invitations FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);
CREATE POLICY IF NOT EXISTS "Users can create invitations" ON invitations FOR INSERT WITH CHECK (
  auth.uid() = from_user_id
);
CREATE POLICY IF NOT EXISTS "Invitation recipients can update" ON invitations FOR UPDATE USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- 消息表：只能看到自己的消息
CREATE POLICY IF NOT EXISTS "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY IF NOT EXISTS "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY IF NOT EXISTS "Users can update own messages" ON messages FOR UPDATE USING (
  auth.uid() = sender_id
);

-- 动态表：所有人可读，只能管理自己的
CREATE POLICY IF NOT EXISTS "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Authors can update posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Authors can delete posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 评论表：所有人可读，只能管理自己的
CREATE POLICY IF NOT EXISTS "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- 点赞表：所有人可读，只能管理自己的
CREATE POLICY IF NOT EXISTS "Likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can unlike" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- 评价表：相关用户可读，只能创建自己的
CREATE POLICY IF NOT EXISTS "Review participants can view" ON reviews FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);
CREATE POLICY IF NOT EXISTS "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = from_user_id
);

-- 通知表：只能看到自己的
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);

-- 黑名单表：只能管理自己的
CREATE POLICY IF NOT EXISTS "Users can view own blacklist" ON blacklist FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY IF NOT EXISTS "Users can add to blacklist" ON blacklist FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY IF NOT EXISTS "Users can remove from blacklist" ON blacklist FOR DELETE USING (
  auth.uid() = user_id
);

-- ==================== 触发器：自动更新 updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 触发器：动态点赞计数 ====================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_likes_count AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ==================== 触发器：动态评论计数 ====================
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comments_count AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ==================== 插入种子数据 ====================
-- 插入示例宠物数据（供演示用）
INSERT INTO users (id, phone, name, avatar, city) VALUES
  ('00000000-0000-0000-0000-000000000001', '13800000001', '小明', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', '上海市徐汇区'),
  ('00000000-0000-0000-0000-000000000002', '13800000002', '小白妈妈', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', '上海市浦东新区'),
  ('00000000-0000-0000-0000-000000000003', '13800000003', '二哈铲屎官', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', '上海市静安区'),
  ('00000000-0000-0000-0000-000000000004', '13800000004', '边牧教练', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', '上海市长宁区'),
  ('00000000-0000-0000-0000-000000000005', '13800000005', '毛球爸爸', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', '上海市黄浦区'),
  ('00000000-0000-0000-0000-000000000006', '13800000006', '豆豆妈', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', '上海市闵行区'),
  ('00000000-0000-0000-0000-000000000007', '13800000007', '橘座大人', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', '上海市徐汇区'),
  ('00000000-0000-0000-0000-000000000008', '13800000008', '花花主人', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', '上海市杨浦区'),
  ('00000000-0000-0000-0000-000000000009', '13800000009', '佛系法斗', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', '上海市普陀区'),
  ('00000000-0000-0000-0000-000000000010', '13800000010', '咪咪主人', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', '上海市虹口区')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pets (id, owner_id, name, breed, species, age, gender, size, personality_tags, energy_level, activity_preferences, social_preferences, photos, bio, vaccine_status, lat, lng) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Lucky', '拉布拉多', 'dog', 2, 'male', 'large', ARRAY['阳光开朗','友好','活泼','忠诚'], 'high', ARRAY['跑步','游泳','捡球','飞盘'], ARRAY['大型犬','小型犬','所有品种'], ARRAY['https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop'], '阳光开朗的拉布拉多，最爱在公园里奔跑，对人和狗都很友好。', 'complete', 31.2350, 121.4750),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', '小白', '萨摩耶', 'dog', 3, 'female', 'large', ARRAY['温柔','爱玩','粘人','友善'], 'medium', ARRAY['散步','玩耍','美容'], ARRAY['所有犬种','猫咪'], ARRAY['https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=400&h=400&fit=crop'], '微笑天使萨摩耶，性格温柔又爱玩，毛发蓬松像一朵大棉花糖。', 'complete', 31.2280, 121.4820),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 'Buddy', '哈士奇', 'dog', 2, 'male', 'large', ARRAY['精力旺盛','调皮','聪明','拆家'], 'high', ARRAY['跑步','拆家','嚎叫','玩雪'], ARRAY['大型犬','所有品种'], ARRAY['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop'], '精力旺盛的二哈，每天需要大量运动，拆家技能满点但超级可爱。', 'partial', 31.2320, 121.4700),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000004', '皮皮', '边境牧羊犬', 'dog', 4, 'male', 'medium', ARRAY['聪明','服从性高','敏捷','专注'], 'high', ARRAY['飞盘','敏捷训练','跑步','学习新技能'], ARRAY['所有犬种'], ARRAY['https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&h=400&fit=crop'], '智商超高的边牧，学什么都会，最喜欢飞盘和敏捷训练。', 'complete', 31.2260, 121.4780),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000005', '毛球', '泰迪', 'dog', 5, 'male', 'small', ARRAY['活泼','粘人','好奇','友善'], 'medium', ARRAY['散步','社交','玩球'], ARRAY['小型犬','中型犬'], ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop'], '活泼的小泰迪，喜欢在主人身边转来转去，散步时最爱跟别的狗狗打招呼。', 'complete', 31.2380, 121.4760),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000006', '豆豆', '柯基', 'dog', 1, 'female', 'small', ARRAY['可爱','活泼','贪吃','撒娇'], 'medium', ARRAY['追球','散步','撒娇'], ARRAY['小型犬','中型犬'], ARRAY['https://images.unsplash.com/photo-1612536053381-696179b53600?w=400&h=400&fit=crop'], '小短腿柯基，虽然腿短但跑起来超快，最喜欢追球和撒娇。', 'complete', 31.2310, 121.4790),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000007', '大橘', '中华田园猫', 'cat', 4, 'male', 'large', ARRAY['稳重','独立','偶尔粘人','佛系'], 'low', ARRAY['睡觉','晒太阳','看窗外','偶尔追逗猫棒'], ARRAY['所有猫咪','友善的狗狗'], ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'], '稳重的大橘猫，喜欢安静地待在沙发上，偶尔会主动来蹭人。', 'partial', 31.2340, 121.4770),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000008', '花花', '阿拉斯加', 'dog', 2, 'female', 'large', ARRAY['外表霸气','内心柔软','胆小','温柔'], 'medium', ARRAY['散步','玩雪','睡觉'], ARRAY['大型犬','中型犬'], ARRAY['https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop'], '外表霸气内心柔软的阿拉斯加，看起来很大只但其实胆子很小，需要温柔对待。', 'complete', 31.2270, 121.4810),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000009', '阿福', '法国斗牛犬', 'dog', 3, 'male', 'medium', ARRAY['佛系','安静','打呼噜','可爱'], 'low', ARRAY['睡觉','吃饭','短距离散步'], ARRAY['所有犬种'], ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop'], '佛系法斗，不爱运动但很爱睡觉，偶尔会打个呼噜，是个安静的陪伴者。', 'complete', 31.2360, 121.4740),
  ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000010', '咪咪', '布偶猫', 'cat', 1, 'female', 'medium', ARRAY['胆小','粘人','温柔','安静'], 'low', ARRAY['被抱着','睡觉','玩逗猫棒'], ARRAY['所有猫咪'], ARRAY['https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop'], '胆小但粘人的布偶猫，喜欢被抱着，对陌生人会比较害羞。', 'complete', 31.2290, 121.4830)
ON CONFLICT (id) DO NOTHING;
