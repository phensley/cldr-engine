#!/bin/bash

ROOT=$(cd `dirname $0`; pwd)/temp
TAR=$ROOT/tzdata.tar.gz
TZDATA=$ROOT/tzdata
ZICOUT=$ROOT/zicout

mkdir -p $ROOT

FILES="
africa antarctica asia australasia etcetera europe
northamerica southamerica pacificnew backward
"

CMDS="zic zdump"

if [ ! -f $TAR ] ; then
    echo "downloading tzdata latest.."
    curl -o $TAR ftp://ftp.iana.org/tz/tzdata-latest.tar.gz
fi

if [ ! -d $TZDATA ] ; then
    mkdir -p $TZDATA
    echo "extracting to $TZDATA"
    tar -xf $TAR -C $TZDATA
fi

for name in $CMDS ; do
    cmd=`which $name`
    if [ $? = 1 ] ; then
        echo "the '$name' command must be installed."
        exit 1
    fi
done

echo "Running 'zic' on $TZDATA"
mkdir -p $ZICOUT
for name in $FILES ; do
    zic -d $ZICOUT $TZDATA/$name
done

