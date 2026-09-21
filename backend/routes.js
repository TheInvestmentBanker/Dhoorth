const r=require("express").Router(),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken"),slugify=require("slugify");
const {protect,authorOnly}=require("./middleware/auth");const {User,Category,Subcategory,Article,Comment,Media,Settings}=require("./models");
r.post("/auth/login", async (q, s, n) => {
  try {
    const identifier = q.body.email?.trim();
    const password = q.body.password;

    if (!identifier || !password) {
      return s.status(400).json({
        message: "Username/email and password are required"
      });
    }

    const u = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: { $regex: `^${identifier}$`, $options: "i" } }
      ]
    }).select("+password");

    if (!u) {
      return s.status(401).json({
        message: "Invalid username/email or password"
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      u.password
    );

    if (!passwordMatches) {
      return s.status(401).json({
        message: "Invalid username/email or password"
      });
    }

    const token = jwt.sign(
      { id: u._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    s.json({
      token,
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role
      }
    });
  } catch (e) {
    n(e);
  }
});
r.get("/auth/me",protect,authorOnly,(q,s)=>s.json({user:q.user}));
r.get("/categories",async(q,s,n)=>{try{s.json({categories:await Category.find({active:true}).sort({name:1}),subcategories:await Subcategory.find({active:true}).populate("category").sort({name:1})})}catch(e){n(e)}});
r.get("/categories/admin/all",protect,authorOnly,async(q,s,n)=>{try{s.json({categories:await Category.find().sort({name:1}),subcategories:await Subcategory.find().populate("category").sort({name:1})})}catch(e){n(e)}});
r.post("/categories",protect,authorOnly,async(q,s,n)=>{try{s.status(201).json(await Category.create({name:q.body.name,slug:slugify(q.body.name,{lower:true,strict:true})}))}catch(e){n(e)}});
r.post("/categories/subcategories",protect,authorOnly,async(q,s,n)=>{try{s.status(201).json(await Subcategory.create({name:q.body.name,category:q.body.category,slug:slugify(q.body.name+"-"+q.body.category,{lower:true,strict:true})}))}catch(e){n(e)}});
r.get("/articles",async(q,s,n)=>{try{let x={status:"published"};if(q.query.category)x.categories=q.query.category;if(q.query.subcategory)x.subcategories=q.query.subcategory;if(q.query.search)x.$or=[{headline:{$regex:q.query.search,$options:"i"}},{summary:{$regex:q.query.search,$options:"i"}},{tags:{$regex:q.query.search,$options:"i"}}];const page=Math.max(1,+q.query.page||1),limit=Math.min(50,Math.max(1,+q.query.limit||12)),sort=q.query.sort==="popular"?{views:-1}:{publishedAt:-1};const[items,total]=await Promise.all([Article.find(x).populate("author categories subcategories").sort(sort).skip((page-1)*limit).limit(limit),Article.countDocuments(x)]);s.json({items,total,page,pages:Math.ceil(total/limit)})}catch(e){n(e)}});
r.get("/articles/slug/:slug",async(q,s,n)=>{try{const a=await Article.findOne({slug:q.params.slug,status:"published"}).populate("author categories subcategories relatedArticles");if(!a)return s.status(404).json({message:"Article not found"});await Article.findByIdAndUpdate(a._id,{$inc:{views:1}});s.json(a)}catch(e){n(e)}});
r.get("/articles/admin/all",protect,authorOnly,async(q,s,n)=>{try{s.json(await Article.find().populate("author categories subcategories").sort({updatedAt:-1}))}catch(e){n(e)}});
r.get("/articles/:id",protect,authorOnly,async(q,s,n)=>{try{s.json(await Article.findById(q.params.id).populate("categories subcategories relatedArticles"))}catch(e){n(e)}});
r.post("/articles",protect,authorOnly,async(q,s,n)=>{try{const d={...q.body,author:q.user._id,slug:q.body.slug||slugify(q.body.headline,{lower:true,strict:true})};if(d.status==="published")d.publishedAt=d.publishedAt||new Date();s.status(201).json(await Article.create(d))}catch(e){n(e)}});
r.put("/articles/:id",protect,authorOnly,async(q,s,n)=>{try{s.json(await Article.findByIdAndUpdate(q.params.id,q.body,{new:true,runValidators:true}))}catch(e){n(e)}});
r.delete("/articles/:id",protect,authorOnly,async(q,s,n)=>{try{s.json(await Article.findByIdAndUpdate(q.params.id,{status:"archived"},{new:true}))}catch(e){n(e)}});
r.get("/comments/article/:id",async(q,s,n)=>{try{s.json(await Comment.find({article:q.params.id,status:"approved"}).sort({createdAt:-1}))}catch(e){n(e)}});
r.post("/comments",async(q,s,n)=>{try{const c=await Comment.create(q.body);s.status(201).json({message:"Comment submitted for moderation",id:c._id})}catch(e){n(e)}});
r.get("/comments/admin/all",protect,authorOnly,async(q,s,n)=>{try{s.json(await Comment.find().populate("article","headline").sort({createdAt:-1}))}catch(e){n(e)}});
r.patch("/comments/:id/status",protect,authorOnly,async(q,s,n)=>{try{s.json(await Comment.findByIdAndUpdate(q.params.id,{status:q.body.status},{new:true}))}catch(e){n(e)}});
r.delete("/comments/:id",protect,authorOnly,async(q,s,n)=>{try{await Comment.findByIdAndDelete(q.params.id);s.json({ok:true})}catch(e){n(e)}});
r.get("/media",protect,authorOnly,async(q,s,n)=>{try{s.json(await Media.find().sort({createdAt:-1}))}catch(e){n(e)}});
r.post("/media/external",protect,authorOnly,async(q,s,n)=>{try{s.status(201).json(await Media.create(q.body))}catch(e){n(e)}});
r.get("/settings",async(q,s,n)=>{try{const a=await Settings.find();s.json(Object.fromEntries(a.map(x=>[x.key,x.value])))}catch(e){n(e)}});
r.put("/settings/:key",protect,authorOnly,async(q,s,n)=>{try{s.json(await Settings.findOneAndUpdate({key:q.params.key},{value:q.body.value},{upsert:true,new:true}))}catch(e){n(e)}});
r.get("/stats",protect,authorOnly,async(q,s,n)=>{try{const[a,b,c,d,v,p,k,recent]=await Promise.all([Article.countDocuments(),Article.countDocuments({status:"published"}),Article.countDocuments({status:"draft"}),Article.countDocuments({status:"scheduled"}),Article.aggregate([{$group:{_id:null,n:{$sum:"$views"}}}]),Comment.countDocuments({status:"pending"}),Category.countDocuments(),Article.find().sort({updatedAt:-1}).limit(6).select("headline status views updatedAt")]);s.json({total:a,published:b,drafts:c,scheduled:d,views:v[0]?.n||0,pendingComments:p,categories:k,recent})}catch(e){n(e)}});
module.exports=r;
